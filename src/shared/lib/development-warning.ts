export function warnInDevelopment(message: string, error: unknown) {
  if (!import.meta.env.DEV) {
    return;
  }

  // eslint-disable-next-line no-console -- Development-only diagnostics are intentionally visible while debugging local failures.
  console.warn(message, error);
}
