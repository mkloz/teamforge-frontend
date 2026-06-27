export const TEST_API_URL = "http://localhost:6969/api/v1";

export function apiRoute(path: string) {
  const normalizedPath = path.replace(/^\/+/u, "");

  return new URL(normalizedPath, `${TEST_API_URL}/`).toString();
}
