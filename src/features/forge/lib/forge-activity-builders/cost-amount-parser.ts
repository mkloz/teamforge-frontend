const CURRENCY_SYMBOL_PATTERN = /\p{Sc}/u;
const EDGE_CURRENCY_SYMBOL_PATTERN = /^\p{Sc}+|\p{Sc}+$/gu;
const WHITESPACE_PATTERN = /\s+/g;
const PLAIN_DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;
const GROUPED_US_PATTERN = /^\d{1,3}(,\d{3})+(\.\d{1,2})?$/;
const GROUPED_EU_PATTERN = /^\d{1,3}(\.\d{3})+(,\d{1,2})?$/;
const COMMA_DECIMAL_PATTERN = /^\d+,\d{1,2}$/;

export function parsePositiveCostAmount(value: string | null | undefined) {
  const normalizedValue = normalizeCostAmountText(value);

  if (!normalizedValue) {
    return null;
  }

  const normalizedNumber = normalizeCostAmountSeparators(normalizedValue);

  if (!normalizedNumber) {
    return null;
  }

  const amount = Number(normalizedNumber);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Number(amount.toFixed(2));
}

function normalizeCostAmountText(value: string | null | undefined) {
  const compactValue = value?.trim().replaceAll(WHITESPACE_PATTERN, "");

  if (!compactValue || /[+-]|[a-z]/i.test(compactValue)) {
    return null;
  }

  const withoutCurrency = compactValue.replace(
    EDGE_CURRENCY_SYMBOL_PATTERN,
    "",
  );

  if (!withoutCurrency || CURRENCY_SYMBOL_PATTERN.test(withoutCurrency)) {
    return null;
  }

  return /^\d[\d,.]*$/.test(withoutCurrency) ? withoutCurrency : null;
}

function normalizeCostAmountSeparators(value: string) {
  if (PLAIN_DECIMAL_PATTERN.test(value)) {
    return value;
  }

  if (GROUPED_US_PATTERN.test(value)) {
    return value.replaceAll(",", "");
  }

  if (GROUPED_EU_PATTERN.test(value)) {
    return value.replaceAll(".", "").replace(",", ".");
  }

  if (COMMA_DECIMAL_PATTERN.test(value)) {
    return value.replace(",", ".");
  }

  return null;
}
