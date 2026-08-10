import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import type { Socket } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  assertStatefulTargetSecurity,
  assertTargetAllowed,
  buildCookieHeader,
  CANONICAL_WEB_ORIGIN,
  COOKIE_CONTRACTS,
  cookieInspectionPassed,
  cookiePathMatches,
  executeWithGuaranteedCleanup,
  inspectCookieContract,
  isAllowedApiOriginPath,
  PUBLIC_API_PREFIX,
  PUBLIC_SOCKET_PATHS,
  parseSetCookie,
  translateGatewayPath,
} from "../../../scripts/audit/gateway-acceptance-contract.mjs";
import {
  runExternalInviteGatewayProbes,
  runPublicGatewayProbes,
} from "../../../scripts/audit/gateway-acceptance-probes.mjs";
import {
  classifyApiOriginRequest,
  classifyFailedResource,
  classifyRouteResponse,
} from "../../../scripts/audit/gateway-browser-acceptance.mjs";
import { verifyDeployedAssetSet } from "../../../scripts/audit/gateway-deployment-integrity.mjs";
import { startLocalPublicGateway } from "../../../scripts/audit/local-public-gateway.mjs";
import { server } from "../../support/msw/server";

const activeCleanup: Array<() => Promise<void>> = [];

beforeAll(() => {
  // This contract suite owns isolated loopback fixtures. Disabling the shared
  // MSW interceptor also prevents it from replacing the native WebSocket used
  // to prove a real polling-to-upgrade handshake.
  server.close();
});

afterEach(async () => {
  for (const cleanup of activeCleanup.splice(0).reverse()) {
    // eslint-disable-next-line no-await-in-loop -- dependent sockets close gateway-first.
    await cleanup();
  }
});

describe("Phase 5 gateway acceptance contract", () => {
  it("requires an exact allowlist and separate remote authorization", () => {
    expect(
      assertTargetAllowed({
        allowRemote: false,
        allowedTargets: ["http://127.0.0.1:6970"],
        target: "http://127.0.0.1:6970",
      }),
    ).toBe("http://127.0.0.1:6970");

    expect(() =>
      assertTargetAllowed({
        allowRemote: false,
        allowedTargets: ["https://api.findafew.today"],
        target: "https://api.findafew.today",
      }),
    ).toThrow(/remote targets require explicit/iu);

    expect(() =>
      assertTargetAllowed({
        allowRemote: true,
        allowedTargets: ["https://api.findafew.today"],
        target: "https://findafew.today",
      }),
    ).toThrow(/exact target allowlist/iu);
  });

  it("rejects remote HTTP before any authenticated or invite credential can be used", () => {
    for (const mode of [
      "authenticated",
      "external-invite",
      "browser-authenticated",
    ]) {
      expect(() =>
        assertStatefulTargetSecurity({
          mode,
          origins: ["http://canary.example.invalid"],
        }),
      ).toThrow(/require HTTPS/iu);
    }
    expect(() =>
      assertStatefulTargetSecurity({
        mode: "authenticated",
        origins: ["http://127.0.0.1:6970"],
      }),
    ).not.toThrow();
  });

  it("translates only the frozen public API and realtime paths", () => {
    expect(translateGatewayPath("/findafew/api/v1/health/ok")).toBe(
      "/api/v1/health/ok",
    );
    expect(translateGatewayPath("/findafew/socket.io")).toBe("/socket.io");
    expect(translateGatewayPath("/findafew/socket.io/")).toBe("/socket.io/");
    expect(PUBLIC_SOCKET_PATHS).toEqual([
      "/findafew/socket.io",
      "/findafew/socket.io/",
    ]);
    expect(translateGatewayPath("/api/v1/health/ok")).toBeNull();
    expect(translateGatewayPath("/findafewish/api/v1/health/ok")).toBeNull();
    expect(translateGatewayPath("/findafew/socket.io//")).toBeNull();
    expect(translateGatewayPath("/findafew/socket.io/unexpected")).toBeNull();
  });

  it("always runs bounded sanitized cleanup after execution errors and timeouts", async () => {
    let exceptionCleanupCalls = 0;
    const exceptionResult = await executeWithGuaranteedCleanup({
      execute: async () => {
        throw new Error("fixture-password-must-not-appear");
      },
      cleanup: async () => {
        exceptionCleanupCalls += 1;
        throw new Error("fixture-token-must-not-appear");
      },
      cleanupTimeoutMs: 50,
    });
    expect(exceptionCleanupCalls).toBe(1);
    expect(exceptionResult).toEqual({
      cleanup: { outcome: "failed", passed: false },
      operation: { outcome: "failed", passed: false },
    });
    expect(JSON.stringify(exceptionResult)).not.toMatch(/password|token/iu);

    let timeoutCleanupCalls = 0;
    const timeoutResult = await executeWithGuaranteedCleanup({
      execute: async () => {
        throw new Error("post-login fixture failure");
      },
      cleanup: (signal) =>
        new Promise((_, reject) => {
          timeoutCleanupCalls += 1;
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          });
        }),
      cleanupTimeoutMs: 10,
    });
    expect(timeoutCleanupCalls).toBe(1);
    expect(timeoutResult.cleanup).toEqual({
      outcome: "timed-out",
      passed: false,
    });
  });

  it("allows only canonical API-origin paths and treats contract/resource failures as route-health failures", () => {
    const common = {
      apiOrigin: "https://api.findafew.today",
      webOrigin: "https://findafew.today",
    };
    const retiredSegment = String.fromCharCode(
      116,
      101,
      97,
      109,
      102,
      111,
      114,
      103,
      101,
    );
    for (const status of [200, 404, 500]) {
      expect(
        classifyRouteResponse({
          ...common,
          method: "GET",
          mode: "browser-public",
          status,
          url: "https://api.findafew.today/wrong/path",
        }),
      ).toBe("unexpected-api-contract-path");
    }
    for (const unexpectedPath of [
      "/findafew/api/v1ish",
      "/findafew/socket.io//",
      "/findafew/socket.io/deeper",
      `/${retiredSegment}/api/v1/health/ok`,
      "/unmatched",
    ]) {
      const url = `https://api.findafew.today${unexpectedPath}`;
      expect(
        classifyApiOriginRequest({ apiOrigin: common.apiOrigin, url }),
      ).toBe("unexpected-api-contract-path");
      expect(
        classifyRouteResponse({
          ...common,
          method: "GET",
          mode: "browser-public",
          status: 200,
          url,
        }),
      ).toBe("unexpected-api-contract-path");
    }
    for (const allowedPath of [
      "/findafew/api/v1/health/ok",
      "/findafew/socket.io",
      "/findafew/socket.io/",
    ]) {
      const url = `https://api.findafew.today${allowedPath}?EIO=4&transport=polling`;
      expect(isAllowedApiOriginPath(allowedPath)).toBe(true);
      expect(
        classifyApiOriginRequest({ apiOrigin: common.apiOrigin, url }),
      ).toBeNull();
      expect(
        classifyRouteResponse({
          ...common,
          method: "GET",
          mode: "browser-public",
          status: 200,
          url,
        }),
      ).toBeNull();
    }
    expect(
      classifyRouteResponse({
        ...common,
        method: "GET",
        mode: "browser-authenticated",
        status: 500,
        url: "https://api.findafew.today/findafew/api/v1/groups",
      }),
    ).toBe("api-response-error");
    expect(
      classifyRouteResponse({
        ...common,
        method: "GET",
        mode: "browser-public",
        status: 401,
        url: "https://api.findafew.today/findafew/api/v1/users/me",
      }),
    ).toBeNull();
    expect(
      classifyRouteResponse({
        ...common,
        method: "POST",
        mode: "browser-authenticated",
        sessionPhase: "unauthenticated",
        status: 401,
        url: "https://api.findafew.today/findafew/api/v1/auth/refresh",
      }),
    ).toBeNull();
    expect(
      classifyRouteResponse({
        ...common,
        method: "GET",
        mode: "browser-public",
        status: 404,
        url: "https://findafew.today/assets/missing.js",
      }),
    ).toBe("web-resource-error");
    expect(
      classifyFailedResource({
        ...common,
        url: "https://api.findafew.today/wrong/path",
      }),
    ).toBe("unexpected-api-contract-path");
    expect(
      classifyFailedResource({
        ...common,
        url: "https://findafew.today/assets/app.js",
      }),
    ).toBe("failed-resource");
    expect(
      classifyFailedResource({
        ...common,
        url: "https://maps.googleapis.com/maps/api/js",
      }),
    ).toBeNull();
  });

  it("validates host-only secure lax cookies and applies RFC path boundaries", () => {
    const cookie = parseSetCookie(
      "findafew_refresh_token=secret-not-retained; Path=/findafew/api/v1/auth; HttpOnly; Secure; SameSite=Lax",
    );
    const inspection = inspectCookieContract(cookie, COOKIE_CONTRACTS.refresh);

    expect(cookieInspectionPassed(inspection)).toBe(true);
    expect(
      cookiePathMatches(
        COOKIE_CONTRACTS.refresh.path,
        `${PUBLIC_API_PREFIX}/auth/refresh`,
      ),
    ).toBe(true);
    expect(
      cookiePathMatches(
        COOKIE_CONTRACTS.refresh.path,
        `${PUBLIC_API_PREFIX}/external-invites/preview`,
      ),
    ).toBe(false);
    expect(
      buildCookieHeader(
        [cookie],
        `${PUBLIC_API_PREFIX}/external-invites/preview`,
      ),
    ).toBe("");
  });

  it("proves public CORS, unauthenticated, fail-closed and polling-upgrade behavior", async () => {
    const fixture = await startFixtureUpstream();
    activeCleanup.push(fixture.close);
    const gateway = await startLocalPublicGateway({
      upstreamOrigin: fixture.origin,
    });
    activeCleanup.push(() => gateway.close());

    const result = await runPublicGatewayProbes(gateway.origin);

    expect(result.status).toBe("passed");
    expect(result.failed).toBe(0);
    expect(
      result.checks.find((check) => check.id === "engine-polling-upgrade"),
    ).toMatchObject({ passed: true });
    expect(
      result.checks.find(
        (check) => check.id === "engine-polling-upgrade-trailing-slash",
      ),
    ).toMatchObject({ passed: true });
    expect(fixture.seenPaths).toContain("/api/v1/health/ok");
    expect(fixture.seenPaths).toContain("/socket.io");
    expect(fixture.seenPaths).toContain("/socket.io/");
    expect(fixture.seenUpgradeUrls).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^\/socket\.io\?EIO=4&transport=websocket&sid=/u),
        expect.stringMatching(
          /^\/socket\.io\/\?EIO=4&transport=websocket&sid=/u,
        ),
      ]),
    );
    const failClosedChecks = result.checks.filter((check) =>
      check.id.startsWith("fail-closed-"),
    );
    expect(failClosedChecks).toHaveLength(7);
    expect(failClosedChecks).toEqual(
      expect.arrayContaining(
        Array.from({ length: 7 }, () =>
          expect.objectContaining({
            passed: true,
            result: { status: 404 },
          }),
        ),
      ),
    );
  });

  it("round-trips external-invite cookies only on the public invite scope", async () => {
    const fixture = await startFixtureUpstream();
    activeCleanup.push(fixture.close);
    const gateway = await startLocalPublicGateway({
      upstreamOrigin: fixture.origin,
    });
    activeCleanup.push(() => gateway.close());

    const result = await runExternalInviteGatewayProbes({
      gatewayOrigin: gateway.origin,
      token: "disposable-fixture-token",
    });

    expect(result.status).toBe("passed");
    expect(result.checks).toHaveLength(4);
  });

  it("binds every approved deployed byte and rejects missing, extra and mismatched assets", async () => {
    const fixture = await createDeploymentFixture();
    activeCleanup.push(fixture.close);

    const passed = await verifyDeployedAssetSet({
      deployDirectory: "dist",
      fetchImpl: fixture.fetchImpl(),
      frontendRoot: fixture.root,
      webOrigin: "https://deploy.example.invalid",
    });
    expect(passed).toMatchObject({
      extraReferencedAssetCount: 0,
      matches: true,
      mismatchedAssetCount: 0,
      missingAssetCount: 0,
    });
    expect(passed.criticalFiles).toEqual({
      index: true,
      manifest: true,
      serviceWorker: true,
    });
    expect(passed.approvedDigest).toBe(passed.deployedDigest);

    const missing = await verifyDeployedAssetSet({
      deployDirectory: "dist",
      fetchImpl: fixture.fetchImpl({ missing: "/assets/app.js" }),
      frontendRoot: fixture.root,
      webOrigin: "https://deploy.example.invalid",
    });
    expect(missing).toMatchObject({ matches: false, missingAssetCount: 1 });

    const byteMismatch = await verifyDeployedAssetSet({
      deployDirectory: "dist",
      fetchImpl: fixture.fetchImpl({
        replacements: { "/assets/app.js": "different deployed bytes" },
      }),
      frontendRoot: fixture.root,
      webOrigin: "https://deploy.example.invalid",
    });
    expect(byteMismatch).toMatchObject({
      matches: false,
      mismatchedAssetCount: 1,
    });

    for (const criticalPath of ["/manifest.webmanifest", "/sw.js"]) {
      // eslint-disable-next-line no-await-in-loop -- each critical file has an independent negative fixture.
      const criticalMismatch = await verifyDeployedAssetSet({
        deployDirectory: "dist",
        fetchImpl: fixture.fetchImpl({
          replacements: { [criticalPath]: "mismatched critical bytes" },
        }),
        frontendRoot: fixture.root,
        webOrigin: "https://deploy.example.invalid",
      });
      expect(criticalMismatch.matches).toBe(false);
      expect(criticalMismatch.mismatchedAssetCount).toBeGreaterThan(0);
    }

    const extra = await verifyDeployedAssetSet({
      deployDirectory: "dist",
      fetchImpl: fixture.fetchImpl({
        replacements: {
          "/index.html":
            '<script src="/assets/app.js"></script><script src="/assets/extra.js"></script><link rel="manifest" href="/manifest.webmanifest">',
          "/assets/extra.js": "extra",
        },
      }),
      frontendRoot: fixture.root,
      webOrigin: "https://deploy.example.invalid",
    });
    expect(extra.matches).toBe(false);
    expect(extra.extraReferencedAssetCount).toBe(1);
  });
});

async function createDeploymentFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "findafew-gateway-"));
  const deployRoot = path.join(root, "dist");
  await mkdir(path.join(deployRoot, "assets"), { recursive: true });
  const files: Record<string, string> = {
    "/assets/app.js": "console.log('approved');",
    "/icon.png": "fixture-icon",
    "/index.html":
      '<script src="/assets/app.js"></script><link rel="manifest" href="/manifest.webmanifest">',
    "/manifest.webmanifest": JSON.stringify({
      icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
      name: "Findafew",
      scope: "/",
      start_url: "/home?source=pwa",
    }),
    "/sw-push.js": "self.addEventListener('push', () => {});",
    "/sw.js":
      'define(["./workbox.js"],function(){precacheAndRoute([{url:"assets/app.js",revision:null},{url:"icon.png",revision:"fixture"},{url:"manifest.webmanifest",revision:"fixture"}])});importScripts("sw-push.js");',
    "/workbox.js": "self.define = self.define || (() => {});",
  };
  for (const [publicPath, contents] of Object.entries(files)) {
    // eslint-disable-next-line no-await-in-loop -- fixture bytes are deterministic.
    await writeFile(path.join(deployRoot, publicPath.slice(1)), contents);
  }

  return {
    close: () => rm(root, { force: true, recursive: true }),
    fetchImpl({
      missing,
      replacements = {},
    }: {
      missing?: string;
      replacements?: Record<string, string>;
    } = {}) {
      return async (input: string | URL) => {
        const pathname = new URL(input).pathname;
        if (pathname === missing)
          return new Response("missing", { status: 404 });
        if (Object.hasOwn(replacements, pathname)) {
          return new Response(replacements[pathname], { status: 200 });
        }
        const relativePath = pathname.slice(1);
        try {
          const bytes = await readFile(path.join(deployRoot, relativePath));
          return new Response(bytes, { status: 200 });
        } catch {
          return new Response("missing", { status: 404 });
        }
      };
    },
    root,
  };
}

async function startFixtureUpstream() {
  const seenPaths: string[] = [];
  const seenUpgradeUrls: string[] = [];
  const sockets = new Set<Socket>();
  const fixtureServer = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://fixture.invalid");
    seenPaths.push(url.pathname);
    handleFixtureRequest(request, response, url);
  });
  fixtureServer.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  fixtureServer.on("upgrade", (request, socket) => {
    seenUpgradeUrls.push(request.url ?? "");
    handleFixtureUpgrade(request, socket);
  });
  await new Promise<void>((resolve) =>
    fixtureServer.listen(0, "127.0.0.1", resolve),
  );
  const address = fixtureServer.address();
  if (!address || typeof address === "string")
    throw new Error("Missing fixture port.");

  return {
    close: () => {
      for (const socket of sockets) socket.destroy();
      return new Promise<void>((resolve, reject) => {
        fixtureServer.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    },
    origin: `http://127.0.0.1:${address.port}`,
    seenPaths,
    seenUpgradeUrls,
  };
}

function handleFixtureRequest(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
) {
  if (request.method === "OPTIONS") {
    const origin = request.headers.origin;
    const headers: Record<string, string> = { vary: "Origin" };
    if (origin === CANONICAL_WEB_ORIGIN) {
      headers["access-control-allow-origin"] = CANONICAL_WEB_ORIGIN;
      headers["access-control-allow-credentials"] = "true";
      headers["access-control-allow-headers"] =
        "authorization, content-type, idempotency-key, x-findafew-onboarding-policy-version, x-requested-with";
      headers["access-control-allow-methods"] = "GET, OPTIONS";
    }
    response.writeHead(204, headers).end();
    return;
  }

  if (url.pathname === "/api/v1/health/ok") {
    sendJson(response, 200, { status: "ok" });
    return;
  }
  if (url.pathname === "/api/v1/users/me") {
    sendJson(response, 401, { message: "Unauthenticated" });
    return;
  }
  if (
    (url.pathname === "/socket.io" || url.pathname === "/socket.io/") &&
    url.searchParams.get("transport") === "polling"
  ) {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end(
      '0{"sid":"phase5-fixture","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000}',
    );
    return;
  }
  if (url.pathname === "/api/v1/external-invites/exchange") {
    response.setHeader("set-cookie", [
      "findafew_external_invite_intent=fixture-intent; Path=/findafew/api/v1/external-invites; HttpOnly; Secure; SameSite=Lax",
      "findafew_external_invite_browser=fixture-browser; Path=/findafew/api/v1/external-invites; HttpOnly; Secure; SameSite=Lax",
    ]);
    sendJson(response, 200, { groupName: "Fixture group" });
    return;
  }
  if (url.pathname === "/api/v1/external-invites/preview") {
    const cookie = request.headers.cookie ?? "";
    const passed =
      cookie.includes("findafew_external_invite_intent=") &&
      cookie.includes("findafew_external_invite_browser=");
    sendJson(response, passed ? 200 : 401, {
      status: passed ? "ok" : "missing",
    });
    return;
  }
  sendJson(response, 404, { message: "Not Found" });
}

function handleFixtureUpgrade(request: IncomingMessage, socket: Socket) {
  const url = new URL(request.url ?? "/", "http://fixture.invalid");
  const key = request.headers["sec-websocket-key"];
  if (
    (url.pathname !== "/socket.io" && url.pathname !== "/socket.io/") ||
    typeof key !== "string"
  ) {
    socket.end("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
    return;
  }
  const accept = createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
  socket.write(
    `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`,
  );
  socket.once("data", (frame) => {
    if (decodeClientTextFrame(frame) === "2probe") {
      socket.write(encodeServerTextFrame("3probe"));
    }
  });
}

function decodeClientTextFrame(frame: Buffer) {
  const length = frame[1] & 0x7f;
  const maskOffset = length === 126 ? 4 : 2;
  const payloadOffset = maskOffset + 4;
  const payloadLength = length === 126 ? frame.readUInt16BE(2) : length;
  const mask = frame.subarray(maskOffset, payloadOffset);
  const payload = frame.subarray(payloadOffset, payloadOffset + payloadLength);
  return Buffer.from(
    payload.map((byte, index) => byte ^ mask[index % 4]),
  ).toString();
}

function encodeServerTextFrame(value: string) {
  const payload = Buffer.from(value);
  return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
}
