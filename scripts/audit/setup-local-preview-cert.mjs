import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { z } from "zod";
import { cwd, loadAuditEnvFiles, writeError, writeOutput } from "./helpers.mjs";

/**
 * @typedef {object} SetupLocalPreviewCertOptions
 * @property {string} certPath Repo-relative or absolute certificate output path.
 * @property {number} days Certificate validity in days.
 * @property {string} dnsName DNS name added to Subject Alternative Name.
 * @property {string} envFile Repo-relative env file to update.
 * @property {boolean} force Whether to replace existing cert/key files.
 * @property {string} host IP address added to Subject Alternative Name.
 * @property {string} keyPath Repo-relative or absolute private-key output path.
 * @property {boolean} trust Whether to trust the certificate in Current User root.
 */

const defaultOptions = {
  certPath:
    process.env.AUDIT_PREVIEW_CERT_PATH ?? "temp/certs/teamforge-audit.crt",
  days: 825,
  dnsName: "localhost",
  envFile: ".env.audit.local",
  force: false,
  host: "127.0.0.1",
  keyPath:
    process.env.AUDIT_PREVIEW_KEY_PATH ?? "temp/certs/teamforge-audit.key",
  trust: true,
};
const certificateSetupResultSchema = z.object({
  certPath: z.string(),
  keyPath: z.string(),
  reused: z.boolean(),
  thumbprint: z.string(),
  trusted: z.boolean(),
});

/**
 * Parses setup CLI arguments.
 *
 * @param {string[]} args Raw process arguments.
 * @returns {SetupLocalPreviewCertOptions} Parsed options.
 */
function parseArgs(args) {
  const options = { ...defaultOptions };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const nextValue = args[index + 1];

    if ((arg === "--cert" || arg === "--cert-path") && nextValue) {
      options.certPath = nextValue;
      index += 1;
      continue;
    }

    if (arg === "--days" && nextValue) {
      options.days = Number(nextValue);
      index += 1;
      continue;
    }

    if (arg === "--dns" && nextValue) {
      options.dnsName = nextValue;
      index += 1;
      continue;
    }

    if (arg === "--env-file" && nextValue) {
      options.envFile = nextValue;
      index += 1;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--host" && nextValue) {
      options.host = nextValue;
      index += 1;
      continue;
    }

    if ((arg === "--key" || arg === "--key-path") && nextValue) {
      options.keyPath = nextValue;
      index += 1;
      continue;
    }

    if (arg === "--no-trust") {
      options.trust = false;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(options.days) || options.days < 1) {
    throw new Error("--days must be a positive number.");
  }

  return options;
}

/**
 * Resolves a path relative to the repo root.
 *
 * @param {string} value Input path.
 * @returns {string} Absolute path.
 */
function resolveRepoPath(value) {
  return path.isAbsolute(value) ? value : path.resolve(cwd, value);
}

/**
 * Returns a repo-relative display path when possible.
 *
 * @param {string} absolutePath Absolute path.
 * @returns {string} Repo-relative path for logs and env files.
 */
function toRepoRelativePath(absolutePath) {
  return path.relative(cwd, absolutePath).replaceAll(path.sep, "/");
}

/**
 * Runs a PowerShell script through pwsh.
 *
 * @param {string} script PowerShell source.
 * @param {string[]} args PowerShell arguments.
 * @returns {string} Stdout.
 */
function runPowerShell(script, args) {
  const scriptPath = path.join(cwd, "temp", "audit-local-preview-cert.ps1");

  mkdirSync(path.dirname(scriptPath), { recursive: true });
  writeFileSync(scriptPath, script, "utf8");

  const result = spawnSync(
    "pwsh",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, ...args],
    {
      cwd,
      encoding: "utf8",
      windowsHide: true,
    },
  );

  rmSync(scriptPath, { force: true });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      throw new Error(
        "PowerShell 7 (`pwsh`) was not found. Install PowerShell 7 or run this script from an environment where `pwsh` is available.",
      );
    }

    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `PowerShell certificate setup failed:\n${result.stderr || result.stdout}`,
    );
  }

  return result.stdout.trim();
}

/**
 * Creates and optionally trusts a local HTTPS certificate using Windows crypto APIs.
 *
 * @param {SetupLocalPreviewCertOptions} options Certificate setup options.
 * @returns {{ certPath: string; keyPath: string; reused: boolean; thumbprint: string; trusted: boolean }} Setup result.
 */
function setupCertificate(options) {
  const certPath = resolveRepoPath(options.certPath);
  const keyPath = resolveRepoPath(options.keyPath);
  const script = String.raw`
param(
  [string]$CertPath,
  [string]$KeyPath,
  [string]$HostName,
  [string]$DnsName,
  [int]$Days,
  [string]$ForceValue,
  [string]$TrustValue
)

$ErrorActionPreference = "Stop"
$force = $ForceValue -eq "true"
$trust = $TrustValue -eq "true"
$reused = $false

function ConvertTo-Pem {
  param(
    [string]$Label,
    [byte[]]$Bytes
  )

  $base64 = [Convert]::ToBase64String($Bytes)
  $lines = [System.Collections.Generic.List[string]]::new()
  $lines.Add("-----BEGIN $Label-----")

  for ($index = 0; $index -lt $base64.Length; $index += 64) {
    $length = [Math]::Min(64, $base64.Length - $index)
    $lines.Add($base64.Substring($index, $length))
  }

  $lines.Add("-----END $Label-----")
  return ($lines -join [Environment]::NewLine) + [Environment]::NewLine
}

$certDirectory = Split-Path -Parent $CertPath
$keyDirectory = Split-Path -Parent $KeyPath
New-Item -ItemType Directory -Force -Path $certDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $keyDirectory | Out-Null

if ((Test-Path $CertPath) -and (Test-Path $KeyPath) -and -not $force) {
  $cert = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new($CertPath)
  $reused = $true
} else {
  $rsa = [System.Security.Cryptography.RSA]::Create(2048)
  $hashAlgorithm = [System.Security.Cryptography.HashAlgorithmName]::SHA256
  $padding = [System.Security.Cryptography.RSASignaturePadding]::Pkcs1
  $request = [System.Security.Cryptography.X509Certificates.CertificateRequest]::new(
    "CN=$HostName",
    $rsa,
    $hashAlgorithm,
    $padding
  )

  $request.CertificateExtensions.Add(
    [System.Security.Cryptography.X509Certificates.X509BasicConstraintsExtension]::new($true, $false, 0, $true)
  )
  $keyUsage = [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::DigitalSignature -bor
    [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::KeyEncipherment -bor
    [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::KeyCertSign
  $request.CertificateExtensions.Add(
    [System.Security.Cryptography.X509Certificates.X509KeyUsageExtension]::new($keyUsage, $true)
  )

  $serverAuth = [System.Security.Cryptography.Oid]::new("1.3.6.1.5.5.7.3.1", "Server Authentication")
  $enhancedKeyUsage = [System.Security.Cryptography.OidCollection]::new()
  $enhancedKeyUsage.Add($serverAuth) | Out-Null
  $request.CertificateExtensions.Add(
    [System.Security.Cryptography.X509Certificates.X509EnhancedKeyUsageExtension]::new($enhancedKeyUsage, $false)
  )

  $sanBuilder = [System.Security.Cryptography.X509Certificates.SubjectAlternativeNameBuilder]::new()
  $sanBuilder.AddIpAddress([System.Net.IPAddress]::Parse($HostName))
  $sanBuilder.AddDnsName($DnsName)
  $request.CertificateExtensions.Add($sanBuilder.Build())

  $notBefore = [DateTimeOffset]::UtcNow.AddDays(-1)
  $notAfter = $notBefore.AddDays($Days)
  $cert = $request.CreateSelfSigned($notBefore, $notAfter)

  [System.IO.File]::WriteAllText(
    $CertPath,
    (ConvertTo-Pem "CERTIFICATE" $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)),
    [System.Text.Encoding]::ASCII
  )
  [System.IO.File]::WriteAllText(
    $KeyPath,
    (ConvertTo-Pem "PRIVATE KEY" $rsa.ExportPkcs8PrivateKey()),
    [System.Text.Encoding]::ASCII
  )
}

if ($trust) {
  Import-Certificate -FilePath $CertPath -CertStoreLocation Cert:\CurrentUser\Root | Out-Null
}

[PSCustomObject]@{
  certPath = $CertPath
  keyPath = $KeyPath
  reused = $reused
  thumbprint = $cert.Thumbprint
  trusted = $trust
} | ConvertTo-Json -Compress
`;

  const output = runPowerShell(script, [
    certPath,
    keyPath,
    options.host,
    options.dnsName,
    String(Math.trunc(options.days)),
    String(options.force),
    String(options.trust),
  ]);
  const parsed = certificateSetupResultSchema.safeParse(JSON.parse(output));

  if (!parsed.success) {
    throw new Error("PowerShell certificate setup returned invalid JSON.");
  }

  return parsed.data;
}

/**
 * Updates or appends audit preview env values without touching credentials.
 *
 * @param {SetupLocalPreviewCertOptions} options Certificate setup options.
 * @param {{ certPath: string; keyPath: string }} result Certificate setup result.
 */
function updateAuditEnvFile(options, result) {
  const envPath = resolveRepoPath(options.envFile);
  const existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const updates = new Map([
    ["AUDIT_PREVIEW_HTTPS", "auto"],
    ["AUDIT_PREVIEW_CERT_PATH", toRepoRelativePath(result.certPath)],
    ["AUDIT_PREVIEW_KEY_PATH", toRepoRelativePath(result.keyPath)],
  ]);
  const seen = new Set();
  const lines = existing ? existing.split(/\r?\n/) : [];
  const nextLines = lines.map((line) => {
    const match = /^([A-Z0-9_]+)=/u.exec(line.trim());

    if (!match || !updates.has(match[1])) {
      return line;
    }

    seen.add(match[1]);

    return `${match[1]}=${updates.get(match[1])}`;
  });

  for (const [key, value] of updates) {
    if (!seen.has(key)) {
      nextLines.push(`${key}=${value}`);
    }
  }

  mkdirSync(path.dirname(envPath), { recursive: true });
  writeFileSync(
    envPath,
    `${nextLines.filter((line, index) => index < nextLines.length - 1 || line).join("\n")}\n`,
    "utf8",
  );
}

/**
 * Runs the local audit certificate setup.
 */
function main() {
  loadAuditEnvFiles();

  if (process.platform !== "win32") {
    throw new Error(
      "This local certificate setup currently targets Windows Current User certificate trust.",
    );
  }

  const options = parseArgs(process.argv.slice(2));
  const result = setupCertificate(options);

  updateAuditEnvFile(options, result);

  writeOutput(
    `${result.reused ? "REUSED" : "CREATED"} audit certificate ${toRepoRelativePath(result.certPath)}`,
  );
  writeOutput(`KEY ${toRepoRelativePath(result.keyPath)}`);
  writeOutput(`THUMBPRINT ${result.thumbprint}`);
  writeOutput(
    result.trusted
      ? "TRUSTED Current User Root certificate store"
      : "SKIPPED trust step",
  );
  writeOutput(`UPDATED ${options.envFile}`);
}

try {
  main();
} catch (error) {
  writeError(error);
  process.exit(1);
}
