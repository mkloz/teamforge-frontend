// @ts-check

/**
 * Escapes content used inside markdown table cells.
 *
 * @param {unknown} value Cell value.
 * @returns {string} Markdown-safe cell text.
 */
export function escapeMarkdownTableCell(value) {
  const text =
    typeof value === "string"
      ? value
      : typeof value === "number" || typeof value === "boolean"
        ? String(value)
        : "";

  return text.replace(/\r?\n/g, " ").replaceAll("|", "\\|").trim();
}

/**
 * Formats compact markdown inline code for generated reports.
 *
 * @param {unknown} value Inline code value.
 * @param {number} [maxLength=80] Maximum display length.
 * @returns {string} Markdown inline code.
 */
export function formatMarkdownCode(value, maxLength = 80) {
  const text = escapeMarkdownTableCell(value).replaceAll("`", "\\`");

  if (text.length <= maxLength) {
    return `\`${text}\``;
  }

  return `\`${text.slice(0, maxLength - 3).trimEnd()}...\``;
}

/**
 * Formats a nullable report score for markdown.
 *
 * @param {number | null} score Score percentage.
 * @returns {string} Display score.
 */
export function formatScore(score) {
  return score === null ? "n/a" : String(score);
}
