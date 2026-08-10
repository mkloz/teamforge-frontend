// @ts-check

import { io } from "socket.io-client";
import { z } from "zod";
import {
  buildCookieHeader,
  CANONICAL_WEB_ORIGIN,
  COOKIE_CONTRACTS,
  cookieInspectionPassed,
  executeWithGuaranteedCleanup,
  FAIL_CLOSED_PATHS,
  getSetCookieLines,
  inspectCookieContract,
  inspectCorsResponse,
  PUBLIC_API_PREFIX,
  PUBLIC_SOCKET_PATH,
  PUBLIC_SOCKET_PATHS,
  parseSetCookie,
} from "./gateway-acceptance-contract.mjs";

const REQUESTED_CORS_HEADERS = [
  "authorization",
  "content-type",
  "idempotency-key",
  "x-findafew-onboarding-policy-version",
  "x-requested-with",
].join(", ");
const engineOpenPacketSchema = z.object({
  sid: z.string().min(1),
  upgrades: z.array(z.string()),
});
const jsonRecordSchema = z.record(z.string(), z.unknown());

/** @param {string} gatewayOrigin Loopback public gateway origin. */
export async function runPublicGatewayProbes(gatewayOrigin) {
  const checks = [];
  const healthUrl = new URL(`${PUBLIC_API_PREFIX}/health/ok`, gatewayOrigin);
  const corsResponse = await fetch(healthUrl, {
    headers: {
      "Access-Control-Request-Headers": REQUESTED_CORS_HEADERS,
      "Access-Control-Request-Method": "GET",
      Origin: CANONICAL_WEB_ORIGIN,
    },
    method: "OPTIONS",
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  const cors = inspectCorsResponse(corsResponse);
  checks.push({
    id: "cors-exact-apex",
    passed: corsInspectionPassed(cors),
    result: cors,
  });

  const wrongOriginResponse = await fetch(healthUrl, {
    headers: {
      "Access-Control-Request-Method": "GET",
      Origin: "https://unapproved-origin.example.invalid",
    },
    method: "OPTIONS",
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  const wrongOriginAllowed =
    wrongOriginResponse.headers.get("access-control-allow-origin") ===
      "https://unapproved-origin.example.invalid" ||
    wrongOriginResponse.headers.get("access-control-allow-origin") === "*";
  checks.push({
    id: "cors-wrong-origin-denied",
    passed: !wrongOriginAllowed && wrongOriginResponse.status < 500,
    result: { status: wrongOriginResponse.status, wrongOriginAllowed },
  });

  const healthResponse = await fetch(healthUrl, {
    headers: { Origin: CANONICAL_WEB_ORIGIN },
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  checks.push({
    id: "public-health",
    passed: healthResponse.ok,
    result: { status: healthResponse.status },
  });

  const unauthenticatedResponse = await fetch(
    new URL(`${PUBLIC_API_PREFIX}/users/me`, gatewayOrigin),
    {
      headers: { Origin: CANONICAL_WEB_ORIGIN },
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    },
  );
  checks.push({
    id: "protected-route-unauthenticated",
    passed: unauthenticatedResponse.status === 401,
    result: { status: unauthenticatedResponse.status },
  });

  for (const [index, requestPath] of FAIL_CLOSED_PATHS.entries()) {
    // eslint-disable-next-line no-await-in-loop -- fail-closed probes are deliberately ordered.
    const response = await fetch(new URL(requestPath, gatewayOrigin), {
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    checks.push({
      id: `fail-closed-${index + 1}`,
      passed: response.status === 404 && !isRedirect(response.status),
      result: { status: response.status },
    });
  }

  for (const [index, socketPath] of PUBLIC_SOCKET_PATHS.entries()) {
    // eslint-disable-next-line no-await-in-loop -- both canonical slash forms are contractual edge probes.
    const transport = await probeEngineIoUpgrade(gatewayOrigin, socketPath);
    checks.push({
      id:
        index === 0
          ? "engine-polling-upgrade"
          : "engine-polling-upgrade-trailing-slash",
      passed: transport.passed,
      result: transport,
    });
  }

  return summarizeChecks(checks);
}

/**
 * Performs explicitly-authorized login/refresh/logout probes. Credential and
 * cookie values remain in memory and are never included in the return value.
 *
 * @param {object} options Authenticated probe options.
 * @param {string} options.email Process-only email.
 * @param {string} options.gatewayOrigin Loopback gateway.
 * @param {string} options.password Process-only password.
 */
export async function runAuthenticatedGatewayProbes({
  email,
  gatewayOrigin,
  password,
}) {
  const checks = [];
  let activeRefreshCookie = null;
  let cleanupEvidence = {
    cookieCleared: false,
    cookieContract: missingCookieInspection(),
    status: null,
  };
  const lifecycle = await executeWithGuaranteedCleanup({
    execute: async () => {
      const loginResponse = await fetch(
        new URL(`${PUBLIC_API_PREFIX}/auth/login`, gatewayOrigin),
        {
          body: JSON.stringify({ email, password }),
          headers: {
            "content-type": "application/json",
            "idempotency-key": crypto.randomUUID(),
            Origin: CANONICAL_WEB_ORIGIN,
          },
          method: "POST",
          redirect: "manual",
          signal: AbortSignal.timeout(15_000),
        },
      );
      const loginPayload = loginResponse.ok
        ? await readJsonRecord(loginResponse)
        : null;
      const accessToken =
        typeof loginPayload?.accessToken === "string"
          ? loginPayload.accessToken
          : null;
      checks.push({
        id: "email-login",
        passed: loginResponse.ok && Boolean(accessToken),
        result: {
          status: loginResponse.status,
          accessTokenPresent: Boolean(accessToken),
        },
      });

      const refreshCookie = findCookie(
        loginResponse.headers,
        COOKIE_CONTRACTS.refresh.name,
      );
      const refreshInspection = refreshCookie
        ? inspectCookieContract(refreshCookie, COOKIE_CONTRACTS.refresh)
        : missingCookieInspection();
      checks.push({
        id: "refresh-cookie-contract",
        passed: refreshCookie
          ? cookieInspectionPassed(refreshInspection)
          : false,
        result: refreshInspection,
      });
      activeRefreshCookie = refreshCookie ?? null;

      if (refreshCookie) {
        const refreshResponse = await fetch(
          new URL(`${PUBLIC_API_PREFIX}/auth/refresh`, gatewayOrigin),
          {
            headers: {
              Cookie: buildCookieHeader(
                [refreshCookie],
                `${PUBLIC_API_PREFIX}/auth/refresh`,
              ),
              Origin: CANONICAL_WEB_ORIGIN,
            },
            method: "POST",
            redirect: "manual",
            signal: AbortSignal.timeout(15_000),
          },
        );
        const refreshPayload = refreshResponse.ok
          ? await readJsonRecord(refreshResponse)
          : null;
        checks.push({
          id: "refresh-cookie-round-trip",
          passed:
            refreshResponse.ok &&
            typeof refreshPayload?.accessToken === "string",
          result: { status: refreshResponse.status },
        });
        const rotatedRefreshCookie = findCookie(
          refreshResponse.headers,
          COOKIE_CONTRACTS.refresh.name,
        );
        const rotationInspection = rotatedRefreshCookie
          ? inspectCookieContract(
              rotatedRefreshCookie,
              COOKIE_CONTRACTS.refresh,
            )
          : missingCookieInspection();
        checks.push({
          id: "refresh-rotation-cookie-contract",
          passed: rotatedRefreshCookie
            ? cookieInspectionPassed(rotationInspection)
            : false,
          result: rotationInspection,
        });
        activeRefreshCookie = rotatedRefreshCookie ?? refreshCookie;
      }

      const realtime = accessToken
        ? await probeAuthenticatedSocket({
            accessToken,
            socketOrigin: gatewayOrigin,
          })
        : {
            connected: false,
            initialTransport: null,
            passed: false,
            reconnectCount: 0,
            upgraded: false,
          };
      checks.push({
        id: "authenticated-realtime",
        passed: realtime.passed,
        result: realtime,
      });
    },
    cleanup: async (signal) => {
      if (!activeRefreshCookie) {
        throw new Error("No revocable browser session was available.");
      }
      cleanupEvidence = await revokeGatewaySession({
        gatewayOrigin,
        refreshCookie: activeRefreshCookie,
        signal,
      });
      if (!cleanupEvidence.cookieCleared) {
        throw new Error("Session revocation was not confirmed.");
      }
    },
  });

  checks.push({
    id: "authenticated-probe-execution",
    passed: lifecycle.operation.passed,
    result: lifecycle.operation,
  });
  checks.push({
    id: "session-cleanup",
    passed: lifecycle.cleanup.passed && cleanupEvidence.cookieCleared,
    result: {
      ...cleanupEvidence,
      outcome: lifecycle.cleanup.outcome,
    },
  });

  return summarizeChecks(checks);
}

/**
 * Exchanges an explicitly supplied disposable invite token, validates both
 * browser cookies, and proves the preview receives them on the same path.
 *
 * @param {object} options Invite probe options.
 * @param {string} options.gatewayOrigin Loopback gateway.
 * @param {string} options.token Process-only disposable token.
 */
export async function runExternalInviteGatewayProbes({ gatewayOrigin, token }) {
  const checks = [];
  const exchangePath = `${PUBLIC_API_PREFIX}/external-invites/exchange`;
  const exchangeResponse = await fetch(new URL(exchangePath, gatewayOrigin), {
    body: JSON.stringify({ token }),
    headers: {
      "content-type": "application/json",
      "idempotency-key": crypto.randomUUID(),
      Origin: CANONICAL_WEB_ORIGIN,
    },
    method: "POST",
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  checks.push({
    id: "external-invite-exchange",
    passed: exchangeResponse.ok,
    result: { status: exchangeResponse.status },
  });

  const cookies = getSetCookieLines(exchangeResponse.headers).map(
    parseSetCookie,
  );
  const contracts = [
    COOKIE_CONTRACTS.externalInviteIntent,
    COOKIE_CONTRACTS.externalInviteBrowser,
  ];
  for (const contract of contracts) {
    const cookie = cookies.find(
      (candidate) => candidate.name === contract.name,
    );
    const inspection = cookie
      ? inspectCookieContract(cookie, contract)
      : missingCookieInspection();
    checks.push({
      id: `${contract.name}-contract`,
      passed: cookie ? cookieInspectionPassed(inspection) : false,
      result: inspection,
    });
  }

  const previewPath = `${PUBLIC_API_PREFIX}/external-invites/preview`;
  const previewResponse = await fetch(new URL(previewPath, gatewayOrigin), {
    headers: {
      Cookie: buildCookieHeader(cookies, previewPath),
      Origin: CANONICAL_WEB_ORIGIN,
    },
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  checks.push({
    id: "external-invite-cookie-round-trip",
    passed: previewResponse.ok,
    result: { status: previewResponse.status },
  });

  return summarizeChecks(checks);
}

/**
 * @param {string} gatewayOrigin Gateway origin.
 * @param {string} [socketPath] Exact public Engine.IO path form.
 */
export async function probeEngineIoUpgrade(
  gatewayOrigin,
  socketPath = PUBLIC_SOCKET_PATH,
) {
  if (!PUBLIC_SOCKET_PATHS.includes(socketPath)) {
    throw new Error("Engine.IO probe path was not canonical.");
  }
  const pollingUrl = new URL(socketPath, gatewayOrigin);
  pollingUrl.searchParams.set("EIO", "4");
  pollingUrl.searchParams.set("transport", "polling");
  pollingUrl.searchParams.set("t", Date.now().toString(36));
  const pollingResponse = await fetch(pollingUrl, {
    signal: AbortSignal.timeout(15_000),
  });
  const body = await pollingResponse.text();
  const openPacket = parseEngineOpenPacket(body);

  if (!pollingResponse.ok || !openPacket) {
    return {
      initialTransport: "polling",
      openPacketValid: false,
      passed: false,
      status: pollingResponse.status,
      upgraded: false,
    };
  }

  const websocketUrl = new URL(socketPath, gatewayOrigin);
  websocketUrl.protocol = websocketUrl.protocol === "https:" ? "wss:" : "ws:";
  websocketUrl.searchParams.set("EIO", "4");
  websocketUrl.searchParams.set("transport", "websocket");
  websocketUrl.searchParams.set("sid", openPacket.sid);
  const upgraded = await completeEngineUpgrade(websocketUrl);

  return {
    initialTransport: "polling",
    openPacketValid: true,
    passed: upgraded,
    status: pollingResponse.status,
    upgraded,
  };
}

async function revokeGatewaySession({ gatewayOrigin, refreshCookie, signal }) {
  const cleanupResponse = await fetch(
    new URL(`${PUBLIC_API_PREFIX}/auth/logout`, gatewayOrigin),
    {
      headers: {
        Cookie: buildCookieHeader(
          [refreshCookie],
          `${PUBLIC_API_PREFIX}/auth/logout`,
        ),
        Origin: CANONICAL_WEB_ORIGIN,
      },
      method: "POST",
      redirect: "manual",
      signal,
    },
  );
  const clearedRefreshCookie = findCookie(
    cleanupResponse.headers,
    COOKIE_CONTRACTS.refresh.name,
  );
  const cookieContract = clearedRefreshCookie
    ? inspectCookieContract(clearedRefreshCookie, COOKIE_CONTRACTS.refresh)
    : missingCookieInspection();
  const cookieCleared = Boolean(
    clearedRefreshCookie &&
      (clearedRefreshCookie.value === "" ||
        String(clearedRefreshCookie.attributes.get("max-age")) === "0"),
  );
  return {
    cookieCleared:
      cleanupResponse.ok &&
      cookieInspectionPassed(cookieContract) &&
      cookieCleared,
    cookieContract,
    status: cleanupResponse.status,
  };
}

function parseEngineOpenPacket(body) {
  if (!body.startsWith("0")) return null;
  try {
    const payload = engineOpenPacketSchema.safeParse(JSON.parse(body.slice(1)));
    return payload.success && payload.data.upgrades.includes("websocket")
      ? { sid: payload.data.sid }
      : null;
  } catch {
    return null;
  }
}

function completeEngineUpgrade(url) {
  return new Promise((resolve) => {
    const socket = new WebSocket(url);
    let finished = false;
    const timeout = setTimeout(() => {
      socket.close();
      finish(false);
    }, 10_000);

    socket.addEventListener("open", () => socket.send("2probe"));
    socket.addEventListener("message", (event) => {
      if (event.data !== "3probe") return;
      socket.send("5");
      socket.close();
      finish(true);
    });
    socket.addEventListener("error", () => finish(false));

    function finish(passed) {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      // eslint-disable-next-line promise/no-multiple-resolved -- `finished` makes event races single-settlement.
      resolve(passed);
    }
  });
}

export function probeAuthenticatedSocket({ accessToken, socketOrigin }) {
  return new Promise((resolve) => {
    const socket = io(new URL("/realtime", socketOrigin).toString(), {
      auth: { token: accessToken },
      forceNew: true,
      path: PUBLIC_SOCKET_PATH,
      reconnection: true,
      reconnectionAttempts: 1,
      timeout: 10_000,
    });
    let connected = false;
    let initialTransport = null;
    let reconnectCount = 0;
    let upgradeCount = 0;
    let finished = false;
    let forcedReconnect = false;
    const timeout = setTimeout(() => finish(false), 20_000);

    socket.io.on("open", () => {
      initialTransport ??= socket.io.engine?.transport.name ?? null;
      socket.io.engine?.once("upgrade", () => {
        if (socket.io.engine?.transport.name === "websocket") {
          upgradeCount += 1;
        }
        maybeReconnectOrFinish();
      });
    });
    socket.io.on("reconnect", () => {
      reconnectCount += 1;
      maybeReconnectOrFinish();
    });
    socket.on("connect", () => {
      connected = true;
      maybeReconnectOrFinish();
    });
    socket.on("connect_error", () => finish(false));

    function maybeReconnectOrFinish() {
      if (!connected || upgradeCount < 1) return;
      if (!forcedReconnect) {
        forcedReconnect = true;
        socket.io.engine?.close();
        return;
      }
      if (reconnectCount >= 1 && upgradeCount >= 2) finish(true);
    }

    function finish(passed) {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      socket.disconnect();
      // eslint-disable-next-line promise/no-multiple-resolved -- `finished` makes socket events single-settlement.
      resolve({
        connected,
        initialTransport,
        passed: Boolean(
          passed &&
            connected &&
            initialTransport === "polling" &&
            upgradeCount >= 2 &&
            reconnectCount >= 1,
        ),
        reconnectCount,
        reconnectUpgraded: upgradeCount >= 2,
        upgraded: upgradeCount >= 1,
      });
    }
  });
}

function findCookie(headers, name) {
  return getSetCookieLines(headers)
    .map(parseSetCookie)
    .find((cookie) => cookie.name === name);
}

function missingCookieInspection() {
  return {
    domainAbsent: false,
    httpOnly: false,
    nameMatches: false,
    pathMatches: false,
    sameSiteLax: false,
    secure: false,
  };
}

function corsInspectionPassed(inspection) {
  return Object.entries(inspection)
    .filter(([key]) => key !== "status")
    .every(([, value]) => value === true);
}

function isRedirect(status) {
  return status >= 300 && status < 400;
}

async function readJsonRecord(response) {
  try {
    const value = jsonRecordSchema.safeParse(await response.json());
    return value.success ? value.data : null;
  } catch {
    return null;
  }
}

function summarizeChecks(checks) {
  const passed = checks.filter((check) => check.passed).length;
  return {
    checks,
    failed: checks.length - passed,
    passed,
    status: passed === checks.length ? "passed" : "failed",
    total: checks.length,
  };
}
