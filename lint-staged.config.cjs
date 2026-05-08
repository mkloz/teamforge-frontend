module.exports = {
  "*.{ts,tsx,js,jsx,mjs,cjs}": [
    "biome check --write --no-errors-on-unmatched",
    "oxlint --config .oxlintrc.json --format stylish --no-error-on-unmatched-pattern",
  ],
  "*.{json,jsonc,css,md}": ["biome check --write --no-errors-on-unmatched"],
};
