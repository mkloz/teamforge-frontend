const STAGED_BIOME_FIX =
  "biome check --write --staged --no-errors-on-unmatched";
const STAGED_CODE_LINT =
  "node scripts/lint-changed.mjs --full-oxlint --staged --stages oxlint,compiler,architecture,types";

module.exports = {
  "*.{ts,tsx,js,jsx,mjs,cjs,json,jsonc,css,md}": () => [
    STAGED_BIOME_FIX,
    STAGED_CODE_LINT,
  ],
};
