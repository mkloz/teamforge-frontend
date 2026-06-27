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
 * @typedef {{ category?: unknown; plugin?: unknown; rule?: unknown; severity?: unknown }} ReactDoctorSignal
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
 * @returns {string} Human-readable blocking policy.
 */
export function getReactDoctorBlockingPolicyText() {
  return "React Doctor errors, Security diagnostics, and selected high-signal React correctness/security rules";
}
