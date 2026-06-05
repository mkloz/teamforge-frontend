import { z } from "zod";

/**
 * @typedef {object} AuditRoute
 * @property {string[]} [expectedFailedRequestPatterns] URL/text fragments for expected failed requests.
 * @property {string} slug File-safe route identifier used for reports.
 * @property {string} path App route path to audit.
 *
 * @typedef {object} ResolveAuditRoutesOptions
 * @property {string} accessToken Bearer token for route discovery.
 * @property {string} apiUrl Backend API URL that includes `/api/v1`.
 */

const routeDiscoveryRecordSchema = z.record(z.string(), z.unknown());

/**
 * Explicit TeamForge route inventory for authenticated local audits.
 *
 * @type {AuditRoute[]}
 */
export const AUDIT_ROUTES = [
  { slug: "01-landing", path: "/" },
  { slug: "02-download", path: "/download" },
  { slug: "03-privacy", path: "/privacy" },
  { slug: "04-terms", path: "/terms" },
  { slug: "05-auth-redirect", path: "/auth" },
  { slug: "06-auth-login", path: "/auth/login" },
  { slug: "07-auth-register", path: "/auth/register" },
  { slug: "08-auth-forgot-password", path: "/auth/forgot-password" },
  {
    slug: "09-auth-reset-password-sample",
    path: "/auth/reset-password/audit-reset-token",
  },
  {
    expectedFailedRequestPatterns: ["/auth/activate/audit-activation-token"],
    slug: "10-auth-activate-sample",
    path: "/auth/activate/audit-activation-token",
  },
  { slug: "11-onboarding-profile", path: "/onboarding/profile" },
  { slug: "12-onboarding-personality", path: "/onboarding/personality" },
  { slug: "13-onboarding-interests", path: "/onboarding/interests" },
  { slug: "14-home", path: "/home" },
  { slug: "15-explore", path: "/explore" },
  { slug: "16-group-detail-sample", path: "/groups/audit-group-id" },
  { slug: "17-activity", path: "/activity" },
  { slug: "18-profile", path: "/profile" },
  { slug: "19-user-detail-sample", path: "/users/audit-user-id" },
  { slug: "20-settings", path: "/settings" },
  { slug: "21-forge", path: "/forge" },
  { slug: "22-not-found-fallback", path: "/__squirrelscan-not-found" },
];

/**
 * Resolves dynamic sample routes to real local audit data when available.
 *
 * @param {ResolveAuditRoutesOptions} options Route discovery options.
 * @returns {Promise<AuditRoute[]>} Route inventory with concrete dynamic IDs.
 */
export async function resolveAuditRoutes({ accessToken, apiUrl }) {
  const [groupId, userId] = await Promise.all([
    resolveGroupId({ accessToken, apiUrl }),
    resolveUserId({ accessToken, apiUrl }),
  ]);

  return AUDIT_ROUTES.map((route) => {
    if (route.slug === "16-group-detail-sample" && groupId) {
      return {
        path: `/groups/${encodeURIComponent(groupId)}`,
        slug: route.slug,
      };
    }

    if (route.slug === "19-user-detail-sample" && userId) {
      return {
        path: `/users/${encodeURIComponent(userId)}`,
        slug: route.slug,
      };
    }

    return route;
  });
}

/**
 * Finds a real group ID for the authenticated audit user.
 *
 * @param {ResolveAuditRoutesOptions} options Route discovery options.
 * @returns {Promise<string | null>} Group ID when one is available.
 */
async function resolveGroupId({ accessToken, apiUrl }) {
  const explicitGroupId = process.env.AUDIT_SAMPLE_GROUP_ID;

  if (explicitGroupId) {
    return explicitGroupId;
  }

  const groups =
    (await fetchItems("groups/home-summary", { accessToken, apiUrl })) ??
    (await fetchItems("groups/activity-feed", { accessToken, apiUrl })) ??
    (await fetchItems("groups", { accessToken, apiUrl }));

  return firstString(groups?.[0]?.id);
}

/**
 * Finds a real user ID for the authenticated audit user.
 *
 * @param {ResolveAuditRoutesOptions} options Route discovery options.
 * @returns {Promise<string | null>} User ID when one is available.
 */
async function resolveUserId({ accessToken, apiUrl }) {
  const explicitUserId = process.env.AUDIT_SAMPLE_USER_ID;

  if (explicitUserId) {
    return explicitUserId;
  }

  const me = await fetchJson("users/me", { accessToken, apiUrl });

  return firstString(me?.id);
}

/**
 * Fetches a paginated `items` response from the backend.
 *
 * @param {string} endpoint API endpoint relative to `/api/v1`.
 * @param {ResolveAuditRoutesOptions} options Route discovery options.
 * @returns {Promise<Record<string, unknown>[] | null>} Items array when available.
 */
async function fetchItems(endpoint, options) {
  const payload = await fetchJson(`${endpoint}?limit=1`, options);
  const items = Array.isArray(payload?.items) ? payload.items : null;

  return items?.filter(isRecord) ?? null;
}

/**
 * Fetches optional JSON for route discovery without failing the audit.
 *
 * @param {string} endpoint API endpoint relative to `/api/v1`.
 * @param {ResolveAuditRoutesOptions} options Route discovery options.
 * @returns {Promise<Record<string, unknown> | null>} JSON object when available.
 */
async function fetchJson(endpoint, { accessToken, apiUrl }) {
  try {
    const response = await fetch(
      new URL(endpoint, ensureTrailingSlash(apiUrl)),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const parsedPayload = routeDiscoveryRecordSchema.safeParse(
      JSON.parse(await response.text()),
    );

    return parsedPayload.success ? parsedPayload.data : null;
  } catch {
    return null;
  }
}

/**
 * Ensures a URL/base path string ends with a slash for `new URL()`.
 *
 * @param {string} value URL-like value.
 * @returns {string} Value with trailing slash.
 */
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

/**
 * Returns a string value or null.
 *
 * @param {unknown} value Value to check.
 * @returns {string | null} String value.
 */
function firstString(value) {
  return typeof value === "string" && value ? value : null;
}

/**
 * Checks whether a value is an object record.
 *
 * @param {unknown} value Value to check.
 * @returns {value is Record<string, unknown>} Whether value is a record.
 */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
