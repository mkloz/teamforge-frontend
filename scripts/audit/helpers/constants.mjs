// @ts-check

import path from "node:path";

export const cwd = process.cwd();
export const DEFAULT_API_URL = "http://localhost:6969/api/v1";
export const DEFAULT_AUDIT_BASE_URL = "http://127.0.0.1:4173";
export const DEFAULT_REFRESH_COOKIE_NAME = "teamforge_refresh_token";
export const DEFAULT_SQUIRREL_BIN =
  process.platform === "win32"
    ? path.join(cwd, "temp", "squirrel", "squirrel.exe")
    : "squirrel";
