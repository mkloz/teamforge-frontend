// @ts-check

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
 *
 * @typedef {object} CertificateSetupResult
 * @property {string} certPath Absolute certificate path.
 * @property {string} keyPath Absolute private-key path.
 * @property {boolean} reused Whether existing files were reused.
 * @property {string} thumbprint Certificate thumbprint.
 * @property {boolean} trusted Whether the certificate was trusted locally.
 *
 * @typedef {keyof SetupLocalPreviewCertOptions} SetupLocalPreviewCertOptionKey
 * @typedef {string | number | boolean} SetupLocalPreviewCertOptionValue
 * @typedef {(options: SetupLocalPreviewCertOptions, value: string) => void} SetupOptionValueHandler
 * @typedef {(options: SetupLocalPreviewCertOptions) => void} SetupOptionFlagHandler
 * @typedef {import("node:child_process").SpawnSyncReturns<string>} PowerShellResult
 *
 * @typedef {object} CertificateSetupPowerShellArgsOptions
 * @property {string} certPath Absolute certificate path.
 * @property {string} keyPath Absolute private-key path.
 * @property {SetupLocalPreviewCertOptions} options Certificate setup options.
 *
 * @typedef {Map<string, string>} AuditPreviewEnvUpdates
 */

/** @type {SetupLocalPreviewCertOptions} */
const defaultOptions = {
  certPath:
    process.env.AUDIT_PREVIEW_CERT_PATH ?? "temp/certs/findafew-audit.crt",
  days: 825,
  dnsName: "localhost",
  envFile: ".env.audit.local",
  force: false,
  host: "127.0.0.1",
  keyPath:
    process.env.AUDIT_PREVIEW_KEY_PATH ?? "temp/certs/findafew-audit.key",
  trust: true,
};
const certificateSetupResultSchema = z.object({
  certPath: z.string(),
  keyPath: z.string(),
  reused: z.boolean(),
  thumbprint: z.string(),
  trusted: z.boolean(),
});
/** @type {Map<string, SetupOptionValueHandler>} */
const optionValueHandlers = new Map([
  ["--cert", (options, value) => setOptionValue(options, "certPath", value)],
  [
    "--cert-path",
    (options, value) => setOptionValue(options, "certPath", value),
  ],
  [
    "--days",
    (options, value) => setOptionValue(options, "days", Number(value)),
  ],
  ["--dns", (options, value) => setOptionValue(options, "dnsName", value)],
  ["--env-file", (options, value) => setOptionValue(options, "envFile", value)],
  ["--host", (options, value) => setOptionValue(options, "host", value)],
  ["--key", (options, value) => setOptionValue(options, "keyPath", value)],
  ["--key-path", (options, value) => setOptionValue(options, "keyPath", value)],
]);
/** @type {Map<string, SetupOptionFlagHandler>} */
const optionFlagHandlers = new Map([
  ["--force", (options) => setOptionValue(options, "force", true)],
  ["--no-trust", (options) => setOptionValue(options, "trust", false)],
]);

/**
 * Parses setup CLI arguments.
 *
 * @param {string[]} args Raw process arguments.
 * @returns {SetupLocalPreviewCertOptions} Parsed options.
 */
function parseArgs(args) {
  const options = { ...defaultOptions };

  for (let index = 0; index < args.length; index += 1) {
    index = applySetupArgument(options, args, index);
  }

  validateSetupOptions(options);

  return options;
}

/**
 * Assigns a parsed option value.
 *
 * @template {SetupLocalPreviewCertOptionKey} K
 * @param {SetupLocalPreviewCertOptions} options Parsed options.
 * @param {K} key Option key.
 * @param {SetupLocalPreviewCertOptions[K]} value Option value.
 */
function setOptionValue(options, key, value) {
  options[key] = value;
}

/**
 * Applies one CLI argument to the parsed options object.
 *
 * @param {SetupLocalPreviewCertOptions} options Parsed options.
 * @param {string[]} args Raw process arguments.
 * @param {number} index Current argument index.
 * @returns {number} Next index to continue parsing from.
 */
function applySetupArgument(options, args, index) {
  const arg = args[index];
  const flagHandler = optionFlagHandlers.get(arg);

  if (flagHandler) {
    flagHandler(options);
    return index;
  }

  const valueHandler = optionValueHandlers.get(arg);
  const nextValue = args[index + 1];

  if (valueHandler && nextValue) {
    valueHandler(options, nextValue);
    return index + 1;
  }

  throw new Error(`Unknown argument: ${arg}`);
}

/**
 * Validates parsed certificate setup options.
 *
 * @param {SetupLocalPreviewCertOptions} options Parsed options.
 */
function validateSetupOptions(options) {
  if (!Number.isFinite(options.days) || options.days < 1) {
    throw new Error("--days must be a positive number.");
  }
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
  const scriptPath = getPowerShellScriptPath();

  writePowerShellScript(scriptPath, script);

  const result = spawnPowerShellScript(scriptPath, args);

  rmSync(scriptPath, { force: true });
  assertPowerShellResult(result);

  return result.stdout.trim();
}

/**
 * Returns the temporary PowerShell script path.
 *
 * @returns {string} PowerShell script path.
 */
function getPowerShellScriptPath() {
  return path.join(cwd, "temp", "audit-local-preview-cert.ps1");
}

/**
 * Writes the generated PowerShell script.
 *
 * @param {string} scriptPath PowerShell script path.
 * @param {string} script PowerShell source.
 */
function writePowerShellScript(scriptPath, script) {
  mkdirSync(path.dirname(scriptPath), { recursive: true });
  writeFileSync(scriptPath, script, "utf8");
}

/**
 * Spawns PowerShell with the generated script.
 *
 * @param {string} scriptPath PowerShell script path.
 * @param {string[]} args PowerShell arguments.
 * @returns {PowerShellResult} Spawn result.
 */
function spawnPowerShellScript(scriptPath, args) {
  return spawnSync(
    "pwsh",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, ...args],
    {
      cwd,
      encoding: "utf8",
      windowsHide: true,
    },
  );
}

/**
 * Throws when the PowerShell process failed.
 *
 * @param {PowerShellResult} result Spawn result.
 */
function assertPowerShellResult(result) {
  if (result.error) {
    throw getPowerShellSpawnError(result.error);
  }

  if (result.status !== 0) {
    throw getPowerShellFailureError(result);
  }
}

/**
 * Converts a spawn failure into the user-facing setup error.
 *
 * @param {Error & { code?: string }} error Spawn error.
 * @returns {Error} Setup error.
 */
function getPowerShellSpawnError(error) {
  if (error.code === "ENOENT") {
    return new Error(
      "PowerShell 7 (`pwsh`) was not found. Install PowerShell 7 or run this script from an environment where `pwsh` is available.",
    );
  }

  return error;
}

/**
 * Converts a non-zero PowerShell exit into the user-facing setup error.
 *
 * @param {PowerShellResult} result Spawn result.
 * @returns {Error} Setup error.
 */
function getPowerShellFailureError(result) {
  return new Error(
    `PowerShell certificate setup failed:\n${result.stderr || result.stdout}`,
  );
}

/**
 * Creates and optionally trusts a local HTTPS certificate using Windows crypto APIs.
 *
 * @param {SetupLocalPreviewCertOptions} options Certificate setup options.
 * @returns {CertificateSetupResult} Setup result.
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

  const output = runPowerShell(
    script,
    getCertificateSetupPowerShellArgs({
      certPath,
      keyPath,
      options,
    }),
  );
  const parsed = certificateSetupResultSchema.safeParse(JSON.parse(output));

  if (!parsed.success) {
    throw new Error("PowerShell certificate setup returned invalid JSON.");
  }

  return parsed.data;
}

/**
 * Builds arguments for the generated PowerShell certificate script.
 *
 * @param {CertificateSetupPowerShellArgsOptions} options PowerShell argument options.
 * @returns {string[]} PowerShell arguments.
 */
function getCertificateSetupPowerShellArgs({ certPath, keyPath, options }) {
  return [
    certPath,
    keyPath,
    options.host,
    options.dnsName,
    String(Math.trunc(options.days)),
    String(options.force),
    String(options.trust),
  ];
}

/**
 * Updates or appends audit preview env values without touching credentials.
 *
 * @param {SetupLocalPreviewCertOptions} options Certificate setup options.
 * @param {Pick<CertificateSetupResult, "certPath" | "keyPath">} result Certificate setup result.
 */
function updateAuditEnvFile(options, result) {
  const envPath = resolveRepoPath(options.envFile);
  const existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const updates = getAuditPreviewEnvUpdates(result);
  const seen = new Set();
  const nextLines = appendMissingAuditEnvLines(
    getUpdatedAuditEnvLines(existing, updates, seen),
    updates,
    seen,
  );

  mkdirSync(path.dirname(envPath), { recursive: true });
  writeFileSync(envPath, formatAuditEnvFile(nextLines), "utf8");
}

/**
 * Builds env file updates for the generated preview certificate.
 *
 * @param {Pick<CertificateSetupResult, "certPath" | "keyPath">} result Certificate setup result.
 * @returns {AuditPreviewEnvUpdates} Env updates.
 */
function getAuditPreviewEnvUpdates(result) {
  return new Map([
    ["AUDIT_PREVIEW_HTTPS", "auto"],
    ["AUDIT_PREVIEW_CERT_PATH", toRepoRelativePath(result.certPath)],
    ["AUDIT_PREVIEW_KEY_PATH", toRepoRelativePath(result.keyPath)],
  ]);
}

/**
 * Applies certificate env updates to existing env file lines.
 *
 * @param {string} existing Existing env file contents.
 * @param {AuditPreviewEnvUpdates} updates Env updates.
 * @param {Set<string>} seen Updated keys already encountered.
 * @returns {string[]} Updated lines.
 */
function getUpdatedAuditEnvLines(existing, updates, seen) {
  const lines = existing ? existing.split(/\r?\n/) : [];

  return lines.map((line) => getUpdatedAuditEnvLine(line, updates, seen));
}

/**
 * Updates one env line when it owns a certificate-related key.
 *
 * @param {string} line Existing env file line.
 * @param {AuditPreviewEnvUpdates} updates Env updates.
 * @param {Set<string>} seen Updated keys already encountered.
 * @returns {string} Updated line.
 */
function getUpdatedAuditEnvLine(line, updates, seen) {
  const match = /^([A-Z0-9_]+)=/u.exec(line.trim());

  if (!match || !updates.has(match[1])) {
    return line;
  }

  seen.add(match[1]);

  return `${match[1]}=${updates.get(match[1])}`;
}

/**
 * Appends any env updates that were not present in the file.
 *
 * @param {string[]} lines Current env lines.
 * @param {AuditPreviewEnvUpdates} updates Env updates.
 * @param {Set<string>} seen Updated keys already encountered.
 * @returns {string[]} Lines with missing updates appended.
 */
function appendMissingAuditEnvLines(lines, updates, seen) {
  for (const [key, value] of updates) {
    if (!seen.has(key)) {
      lines.push(`${key}=${value}`);
    }
  }

  return lines;
}

/**
 * Formats env lines with one trailing newline.
 *
 * @param {string[]} lines Env file lines.
 * @returns {string} Env file contents.
 */
function formatAuditEnvFile(lines) {
  return `${lines.filter(shouldKeepAuditEnvOutputLine).join("\n")}\n`;
}

/**
 * Keeps all non-final lines and drops the final empty output line.
 *
 * @param {string} line Env file line.
 * @param {number} index Line index.
 * @param {string[]} lines All env file lines.
 * @returns {boolean} Whether to keep the line.
 */
function shouldKeepAuditEnvOutputLine(line, index, lines) {
  return index < lines.length - 1 || Boolean(line);
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
