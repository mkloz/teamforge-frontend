export function stripPanelStatusPrefix(value: string, statusLabel: string) {
  const prefix = `${statusLabel} `;

  if (!value.toLowerCase().startsWith(prefix.toLowerCase())) {
    return value;
  }

  const strippedValue = value.slice(prefix.length).trim();
  return strippedValue || value;
}
