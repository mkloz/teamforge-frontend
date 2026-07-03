// @ts-check

export const HIGH_SIGNAL_REACT_DOCTOR_RULES = new Set([
  "react-doctor/build-pipeline-secret-boundary",
  "react-doctor/clickjacking-redirect-risk",
  "react-doctor/insecure-crypto-risk",
  "react-doctor/no-react19-deprecated-apis",
  "react-doctor/no-render-in-render",
  "react-doctor/rules-of-hooks",
  "react-doctor/url-prefilled-privileged-action",
  "react-doctor/zod-v4-no-deprecated-schema-apis",
  "react-hooks-js/hooks",
  "react-hooks-js/immutability",
  "react-hooks-js/refs",
]);

export const ADVISORY_REACT_DOCTOR_RULES = new Set([
  "react-doctor/js-combine-iterations",
  "react-doctor/js-tosorted-immutable",
  "react-doctor/use-lazy-motion",
]);

/**
 * @typedef {{ column: number; filePath: string; line: number; packageName?: string; plugin: string; reason: string; rule: string }} ReactDoctorFalsePositive
 */

/** @type {readonly ReactDoctorFalsePositive[]} */
export const REACT_DOCTOR_FALSE_POSITIVES = [
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "@bensandee/eslint-plugin",
    plugin: "deslop",
    reason:
      "Loaded by .oxlintrc.json jsPlugins and enforced through bensandee/* rules plus matching oxlint suppressions in quality scripts.",
    rule: "unused-dev-dependency",
  },
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "@doist/react-compiler-tracker",
    plugin: "deslop",
    reason:
      "Resolved as the react-compiler-tracker binary by scripts/lint/full.mjs, scripts/lint/changed.mjs, and scripts/verify/index.mjs.",
    rule: "unused-dev-dependency",
  },
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "dependency-cruiser",
    plugin: "deslop",
    reason:
      "Resolved as depcruise by lint, changed-file, verify, and health scripts against .dependency-cruiser.cjs.",
    rule: "unused-dev-dependency",
  },
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "fallow",
    plugin: "deslop",
    reason:
      "Resolved by scripts/lint/fallow.mjs and scripts/quality/intelligence.mjs; .fallowrc.json configures the repo quality run.",
    rule: "unused-dev-dependency",
  },
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "knip",
    plugin: "deslop",
    reason:
      "Resolved by scripts/lint/knip.mjs and invoked from scripts/verify/index.mjs and scripts/context/health.mjs.",
    rule: "unused-dev-dependency",
  },
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "oxlint-plugin-inhuman",
    plugin: "deslop",
    reason:
      "Loaded by .oxlintrc.json jsPlugins and enforced through the inhuman/no-swallowed-catch rule.",
    rule: "unused-dev-dependency",
  },
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "oxlint-plugin-query",
    plugin: "deslop",
    reason:
      "Loaded by .oxlintrc.json jsPlugins from node_modules and enforced through oxlint-plugin-query/* TanStack Query rules.",
    rule: "unused-dev-dependency",
  },
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "oxlint-tailwindcss",
    plugin: "deslop",
    reason:
      "Loaded by .oxlintrc.json jsPlugins and enforced through tailwindcss/* class and token rules.",
    rule: "unused-dev-dependency",
  },
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "react-doctor",
    plugin: "deslop",
    reason:
      "Resolved by scripts/quality/react-doctor.mjs and consumed by scripts/quality/intelligence.mjs plus agent health reports.",
    rule: "unused-dev-dependency",
  },
  {
    column: 0,
    filePath: "package.json",
    line: 0,
    packageName: "repomix",
    plugin: "deslop",
    reason:
      "Resolved by scripts/context/pack.mjs for npm run agent:pack context bundles under temp/repomix/.",
    rule: "unused-dev-dependency",
  },
  {
    column: 9,
    filePath: "src/app/router/route-guards.impl.ts",
    line: 50,
    plugin: "react-doctor",
    reason:
      "returnTo is relative-only and route-allowlisted; generated headers also set frame-ancestors 'none' and X-Frame-Options: DENY.",
    rule: "clickjacking-redirect-risk",
  },
  {
    column: 14,
    filePath: "src/shared/lib/auth-route.ts",
    line: 112,
    plugin: "react-doctor",
    reason:
      "URL state only restores allowed app navigation after auth; it does not prefill or execute a privileged action.",
    rule: "url-prefilled-privileged-action",
  },
  {
    column: 5,
    filePath: "src/features/activity/api/messages/optimistic-message-match.ts",
    line: 76,
    plugin: "react-doctor",
    reason:
      "Attachment signature is a local optimistic-cache reconciliation fingerprint, not cryptography, auth material, or a security boundary.",
    rule: "insecure-crypto-risk",
  },
  {
    column: 10,
    filePath:
      "src/features/activity/components/chat/unified-conversation-view/unified-message-input/giphy-picker-panel.tsx",
    line: 97,
    plugin: "react-doctor",
    reason:
      "@giphy/react-components Grid initializes its paginator from the initial fetchGifs prop; keeping the GiphyFetch client stable avoids prop churn between search-key remounts.",
    rule: "react-compiler-no-manual-memoization",
  },
  {
    column: 10,
    filePath:
      "src/features/activity/components/chat/unified-conversation-view/unified-message-input/giphy-picker-panel.tsx",
    line: 107,
    plugin: "react-doctor",
    reason:
      "@giphy/react-components documents key-based Grid recreation when fetchGifs changes, and Grid's paginator captures fetchGifs at construction.",
    rule: "react-compiler-no-manual-memoization",
  },
];

/**
 * @typedef {{ category?: unknown; column?: unknown; filePath?: unknown; line?: unknown; message?: unknown; plugin?: unknown; rule?: unknown; severity?: unknown }} ReactDoctorSignal
 */

/**
 * @param {ReactDoctorSignal} signal React Doctor diagnostic-like object.
 * @returns {string} Stable rule id.
 */
export function getReactDoctorRuleId(signal) {
  if (typeof signal.plugin === "string" && typeof signal.rule === "string") {
    return `${signal.plugin}/${signal.rule}`;
  }

  return typeof signal.rule === "string" ? signal.rule : "unknown/unknown";
}

/**
 * @param {ReactDoctorSignal} signal React Doctor diagnostic-like object.
 * @returns {boolean} Whether the diagnostic is calibrated as blocking.
 */
export function isReactDoctorBlockingSignal(signal) {
  return (
    signal.severity === "error" ||
    signal.category === "Security" ||
    HIGH_SIGNAL_REACT_DOCTOR_RULES.has(getReactDoctorRuleId(signal))
  );
}

/**
 * @param {ReactDoctorSignal} signal React Doctor diagnostic-like object.
 * @returns {ReactDoctorFalsePositive | undefined} Matching confirmed false positive.
 */
export function getReactDoctorFalsePositive(signal) {
  if (
    typeof signal.filePath !== "string" ||
    typeof signal.plugin !== "string" ||
    typeof signal.rule !== "string"
  ) {
    return undefined;
  }

  const filePath = signal.filePath.replaceAll("\\", "/");
  const line = normalizeDiagnosticLocation(signal.line);
  const column = normalizeDiagnosticLocation(signal.column);

  return REACT_DOCTOR_FALSE_POSITIVES.find(
    (falsePositive) =>
      falsePositive.filePath === filePath &&
      falsePositive.plugin === signal.plugin &&
      falsePositive.rule === signal.rule &&
      falsePositive.line === line &&
      falsePositive.column === column &&
      matchesFalsePositiveMessage(falsePositive, signal),
  );
}

/**
 * @param {ReactDoctorFalsePositive} falsePositive Confirmed false positive.
 * @param {ReactDoctorSignal} signal React Doctor diagnostic-like object.
 * @returns {boolean} Whether message-specific evidence matches.
 */
function matchesFalsePositiveMessage(falsePositive, signal) {
  if (!falsePositive.packageName) {
    return true;
  }

  return getUnusedDevDependencyName(signal) === falsePositive.packageName;
}

/**
 * @param {ReactDoctorSignal} signal React Doctor diagnostic-like object.
 * @returns {string | undefined} Unused devDependency package from the message.
 */
function getUnusedDevDependencyName(signal) {
  if (
    signal.filePath !== "package.json" ||
    signal.plugin !== "deslop" ||
    signal.rule !== "unused-dev-dependency" ||
    typeof signal.message !== "string"
  ) {
    return undefined;
  }

  return /^Unused devDependency: `([^`]+)`$/.exec(signal.message)?.[1];
}

/**
 * @param {unknown} value Diagnostic location field.
 * @returns {number | undefined} Numeric location.
 */
function normalizeDiagnosticLocation(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

/**
 * @returns {string} Human-readable blocking policy.
 */
export function getReactDoctorBlockingPolicyText() {
  return "React Doctor errors, Security diagnostics, and selected high-signal React correctness/security rules";
}
