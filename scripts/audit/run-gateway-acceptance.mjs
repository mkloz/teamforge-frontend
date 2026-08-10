#!/usr/bin/env node

// @ts-check

import { existsSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assertStatefulTargetSecurity,
  assertTargetAllowed,
  CANONICAL_API_ORIGIN,
  CANONICAL_WEB_ORIGIN,
  executeWithGuaranteedCleanup,
  GATEWAY_MODES,
  hashOrigin,
  isLoopbackOrigin,
  parseExactOrigin,
  verifyDeployBuild,
} from "./gateway-acceptance-contract.mjs";
import {
  runAuthenticatedGatewayProbes,
  runExternalInviteGatewayProbes,
  runPublicGatewayProbes,
} from "./gateway-acceptance-probes.mjs";
import { runBrowserAcceptance } from "./gateway-browser-acceptance.mjs";
import { startLocalPublicGateway } from "./local-public-gateway.mjs";

const frontendRoot = process.cwd();
const defaultOutput = path.join(
  frontendRoot,
  "temp",
  "gateway-acceptance",
  "summary.json",
);
await main().catch(async (error) => {
  await deleteRawTraceFiles().catch(() => ({ deleted: 0, remaining: 0 }));
  process.stderr.write(
    `${error instanceof Error ? error.message : "Gateway acceptance failed."}\n`,
  );
  process.exitCode = 1;
});

async function main() {
  if ((process.env.NODE_OPTIONS ?? "").includes("--env-file")) {
    throw new Error(
      "NODE_OPTIONS env-file loading is prohibited for this harness.",
    );
  }
  const args = parseArgs(process.argv.slice(2));
  assertArgs(args);
  const build = await verifyDeployBuild({
    deployDirectory: args.deployDirectory,
    expectedDigest: args.expectedBuildDigest,
    frontendRoot,
  });

  if (!build.matchesExpected) {
    throw new Error(
      "Deploy build digest did not match the explicit expected digest.",
    );
  }

  const startedAt = Date.now();
  let lane;
  let target;

  if (args.mode.startsWith("browser-")) {
    target = prepareBrowserTarget(args);
    lane = await runBrowserMode(args, target);
  } else {
    target = prepareGatewayTarget(args);
    lane = await runGatewayMode(args);
  }

  const rawArtifacts = await deleteRawTraceFiles();
  const overallStatus = lane.status === "passed" ? "passed" : "failed";
  const summary = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    mode: args.mode,
    durationMs: Date.now() - startedAt,
    build: {
      algorithm: build.algorithm,
      digest: build.digest,
      fileCount: build.fileCount,
      matchesExpected: build.matchesExpected,
    },
    policy: {
      authenticated: args.mode.includes("authenticated"),
      credentialSource: args.mode.includes("authenticated")
        ? "process-environment-only"
        : args.mode === "external-invite"
          ? "process-environment-only"
          : "none",
      destructiveMethodsImplemented: false,
      persistedAuthState: false,
      rawTraceRetained: false,
      targetAllowlistRequired: true,
    },
    target,
    lane,
    rawArtifacts,
    overallStatus,
  };

  await writeSummary(args.output, summary);
  process.stdout.write(
    `PHASE5_GATEWAY_ACCEPTANCE ${args.mode} ${overallStatus}\n`,
  );
  process.stdout.write(`SUMMARY ${path.relative(frontendRoot, args.output)}\n`);
  process.stdout.write(`BUILD_SHA256 ${build.digest}\n`);

  if (overallStatus !== "passed") process.exitCode = 1;
}

function parseArgs(argv) {
  const values = new Map();
  const allowedTargets = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--env-file" || arg.startsWith("--env-file=")) {
      throw new Error(
        "Environment files are prohibited; use ephemeral process env.",
      );
    }
    if (/password|credential|token/iu.test(arg)) {
      throw new Error("Secrets are prohibited in command-line arguments.");
    }
    if (!arg.startsWith("--"))
      throw new Error("Unexpected positional argument.");

    const [inlineKey, inlineValue] = arg.slice(2).split(/=(.*)/su);
    const key = inlineKey;
    const nextValue = inlineValue ?? argv[index + 1];
    const isFlag = key.startsWith("authorize-");

    if (isFlag) {
      values.set(key, true);
      continue;
    }
    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`Missing value for --${key}.`);
    }
    if (inlineValue === undefined) index += 1;
    if (key === "allow-target") allowedTargets.push(nextValue);
    else values.set(key, nextValue);
  }

  return {
    allowRemoteReadOnly: values.get("authorize-remote-read-only") === true,
    allowRemoteStateful: values.get("authorize-remote-stateful") === true,
    allowedTargets,
    apiOrigin: values.get("api-origin") ?? CANONICAL_API_ORIGIN,
    authorizeAuthenticated:
      values.get("authorize-authenticated-session") === true,
    authorizeInviteExchange: values.get("authorize-invite-exchange") === true,
    deployDirectory: values.get("deploy-dir") ?? "dist",
    expectedBuildDigest: values.get("expected-build-sha256") ?? "",
    groupId: values.get("sample-group-id"),
    mode: values.get("mode") ?? "public",
    output: path.resolve(values.get("output") ?? defaultOutput),
    upstreamOrigin: values.get("upstream-origin"),
    userId: values.get("sample-user-id"),
    webOrigin: values.get("web-origin") ?? CANONICAL_WEB_ORIGIN,
  };
}

function assertArgs(args) {
  if (!GATEWAY_MODES.has(args.mode)) {
    throw new Error("Unknown gateway acceptance mode.");
  }
  assertSafeOutput(args.output);

  if (args.mode.includes("authenticated") && !args.authorizeAuthenticated) {
    throw new Error(
      "Authenticated mode requires explicit session authorization.",
    );
  }
  if (args.mode === "external-invite" && !args.authorizeInviteExchange) {
    throw new Error(
      "Invite exchange mode requires explicit stateful authorization.",
    );
  }
  if (
    (args.mode.includes("authenticated") || args.mode === "external-invite") &&
    args.allowRemoteReadOnly &&
    !args.allowRemoteStateful
  ) {
    throw new Error(
      "Remote stateful modes require separate stateful authorization.",
    );
  }
}

function prepareGatewayTarget(args) {
  if (!args.upstreamOrigin) {
    throw new Error("Gateway modes require an explicit upstream origin.");
  }
  const origin = assertTargetAllowed({
    allowRemote: args.allowRemoteReadOnly,
    allowedTargets: args.allowedTargets,
    target: args.upstreamOrigin,
  });
  if (
    (args.mode === "authenticated" || args.mode === "external-invite") &&
    !isLoopbackOrigin(origin) &&
    !args.allowRemoteStateful
  ) {
    throw new Error(
      "Remote stateful execution requires explicit authorization.",
    );
  }
  assertStatefulTargetSecurity({ mode: args.mode, origins: [origin] });
  return summarizeTarget(origin, "canary-upstream");
}

function prepareBrowserTarget(args) {
  const webOrigin = assertTargetAllowed({
    allowRemote: args.allowRemoteReadOnly,
    allowedTargets: args.allowedTargets,
    target: args.webOrigin,
  });
  const apiOrigin = assertTargetAllowed({
    allowRemote: args.allowRemoteReadOnly,
    allowedTargets: args.allowedTargets,
    target: args.apiOrigin,
  });

  if (
    webOrigin !== CANONICAL_WEB_ORIGIN ||
    apiOrigin !== CANONICAL_API_ORIGIN
  ) {
    throw new Error(
      "Browser modes require the exact canonical web and API origins.",
    );
  }
  if (
    args.mode === "browser-authenticated" &&
    (!args.allowRemoteStateful || !args.allowRemoteReadOnly)
  ) {
    throw new Error(
      "Remote authenticated browser execution requires explicit authorization.",
    );
  }
  assertStatefulTargetSecurity({
    mode: args.mode,
    origins: [webOrigin, apiOrigin],
  });

  return {
    api: summarizeTarget(apiOrigin, "public-api"),
    web: summarizeTarget(webOrigin, "public-web"),
  };
}

async function runGatewayMode(args) {
  const gateway = await startLocalPublicGateway({
    upstreamOrigin: args.upstreamOrigin,
  });
  let lane;
  const lifecycle = await executeWithGuaranteedCleanup({
    execute: async () => {
      if (args.mode === "public") {
        lane = await runPublicGatewayProbes(gateway.origin);
        return;
      }
      if (args.mode === "authenticated") {
        const email = requireSecretEnv("PHASE5_USER_EMAIL");
        const password = requireSecretEnv("PHASE5_USER_PASSWORD");
        lane = await runAuthenticatedGatewayProbes({
          email,
          gatewayOrigin: gateway.origin,
          password,
        });
        return;
      }

      const token = requireSecretEnv("PHASE5_EXTERNAL_INVITE_TOKEN");
      lane = await runExternalInviteGatewayProbes({
        gatewayOrigin: gateway.origin,
        token,
      });
    },
    cleanup: async () => gateway.close(),
  });
  if (!lifecycle.operation.passed || !lifecycle.cleanup.passed || !lane) {
    throw new Error("Gateway lane or bounded gateway cleanup failed.");
  }
  return lane;
}

async function runBrowserMode(args) {
  const authenticated = args.mode === "browser-authenticated";
  return runBrowserAcceptance({
    apiOrigin: parseExactOrigin(args.apiOrigin, "API origin"),
    deployDirectory: args.deployDirectory,
    email: authenticated ? requireSecretEnv("PHASE5_USER_EMAIL") : undefined,
    frontendRoot,
    groupId: authenticated
      ? requireArg(args.groupId, "sample group ID")
      : undefined,
    mode: args.mode,
    password: authenticated
      ? requireSecretEnv("PHASE5_USER_PASSWORD")
      : undefined,
    userId: authenticated
      ? requireArg(args.userId, "sample user ID")
      : undefined,
    webOrigin: parseExactOrigin(args.webOrigin, "Web origin"),
  });
}

function requireSecretEnv(key) {
  const value = process.env[key];
  if (!value)
    throw new Error(`Missing required ephemeral environment key: ${key}.`);
  return value;
}

function requireArg(value, label) {
  if (!value) throw new Error(`Missing required ${label}.`);
  return value;
}

function summarizeTarget(origin, role) {
  return {
    classification: isLoopbackOrigin(origin) ? "loopback" : "remote",
    originSha256: hashOrigin(origin),
    role,
  };
}

function assertSafeOutput(output) {
  const tempRoot = path.resolve(frontendRoot, "temp", "gateway-acceptance");
  const phase5Root = path.resolve(
    frontendRoot,
    "..",
    "reports",
    "findafew-implementation",
    "phase-5",
  );
  const isInside = (root) =>
    output === root || output.startsWith(`${root}${path.sep}`);
  if (!isInside(tempRoot) && !isInside(phase5Root)) {
    throw new Error(
      "Summary output must remain in the governed temp or Phase 5 report root.",
    );
  }
}

async function writeSummary(output, summary) {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(summary, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  }).catch((error) => {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      throw new Error(
        "Summary target already exists; remove it explicitly before rerun.",
      );
    }
    throw error;
  });
}

async function deleteRawTraceFiles() {
  const root = path.join(frontendRoot, "temp", "gateway-acceptance");
  if (!existsSync(root)) return { deleted: 0, remaining: 0 };
  const traces = await findTraceFiles(root);
  for (const tracePath of traces) {
    // eslint-disable-next-line no-await-in-loop -- exact files are validated before deletion.
    await rm(tracePath, { force: true });
  }
  return {
    deleted: traces.length,
    remaining: (await findTraceFiles(root)).length,
  };
}

async function findTraceFiles(root) {
  const found = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        // eslint-disable-next-line no-await-in-loop -- bounded temp traversal.
        await visit(target);
      } else if (entry.isFile() && entry.name === "trace.zip") {
        found.push(target);
      }
    }
  }
  await visit(root);
  return found;
}
