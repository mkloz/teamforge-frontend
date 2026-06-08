import type { Options } from "ky";

export type ApiAuthMode = "access" | "refresh" | "none";

export interface ApiRequestContext {
  auth?: ApiAuthMode;
  retryOnUnauthorized?: boolean;
}

export interface ResolvedApiRequestContext {
  auth: ApiAuthMode;
  retryOnUnauthorized: boolean;
}

function isApiAuthMode(value: unknown): value is ApiAuthMode {
  return (
    typeof value === "string" &&
    (value === "access" || value === "refresh" || value === "none")
  );
}

export function readApiRequestContext(
  options?: Options,
): ResolvedApiRequestContext {
  const context = options?.context;

  return {
    auth: context && isApiAuthMode(context.auth) ? context.auth : "access",
    retryOnUnauthorized:
      context && typeof context.retryOnUnauthorized === "boolean"
        ? context.retryOnUnauthorized
        : true,
  };
}
