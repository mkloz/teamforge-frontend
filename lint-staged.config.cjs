module.exports = {
  "*.{ts,tsx,js,jsx,mjs,cjs}": [
    "biome check --write --error-on-warnings --no-errors-on-unmatched",
    "oxlint --config .oxlintrc.json --format stylish --deny-warnings --no-error-on-unmatched-pattern",
  ],
  "*.{json,jsonc,css,md}": [
    "biome check --write --error-on-warnings --no-errors-on-unmatched",
  ],
};
