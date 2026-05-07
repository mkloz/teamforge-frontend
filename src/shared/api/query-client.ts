import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { telemetryErrorScopes } from "@/shared/lib/telemetry-contract";

const DEFAULT_QUERY_STALE_TIME_MS = 60_000;
const DEFAULT_QUERY_GC_TIME_MS = 5 * 60_000;
const MAX_QUERY_RETRY_FAILURES = 2;
const NON_RETRYABLE_HTTP_STATUSES = new Set([401, 403, 404]);

function isNonRetryableHttpError(error: unknown) {
  return (
    error instanceof HTTPError &&
    NON_RETRYABLE_HTTP_STATUSES.has(error.response.status)
  );
}

function shouldRetry(failureCount: number, error: unknown) {
  if (isNonRetryableHttpError(error)) {
    return false;
  }

  return failureCount < MAX_QUERY_RETRY_FAILURES;
}

function getMutationTelemetryName(mutationMeta: unknown) {
  if (
    mutationMeta &&
    typeof mutationMeta === "object" &&
    "telemetryName" in mutationMeta &&
    typeof mutationMeta.telemetryName === "string"
  ) {
    return mutationMeta.telemetryName;
  }

  return undefined;
}

export function createAppQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        captureException(telemetryErrorScopes.queryError, error, {
          queryKey: JSON.stringify(query.queryKey),
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const mutationName = getMutationTelemetryName(mutation.meta);

        captureException(telemetryErrorScopes.mutationError, error, {
          mutationKey: JSON.stringify(mutation.options.mutationKey ?? []),
          mutationName,
        });

        if (mutationName) {
          trackMutationOutcome(mutationName, "error");
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_QUERY_STALE_TIME_MS,
        gcTime: DEFAULT_QUERY_GC_TIME_MS,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export const appQueryClient = createAppQueryClient();
