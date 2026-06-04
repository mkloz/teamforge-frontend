/**
 * @typedef {object} AuditRoute
 * @property {string} slug File-safe route identifier used for reports.
 * @property {string} path App route path to audit.
 */

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
