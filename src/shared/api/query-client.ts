import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { telemetryErrorScopes } from "@/shared/lib/telemetry-contract";

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof HTTPError) {
    const { status } = error.response;

    if (status === 401 || status === 403 || status === 404) {
      return false;
    }
  }

  return failureCount < 2;
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
        const mutationName =
          typeof mutation.meta?.telemetryName === "string"
            ? mutation.meta.telemetryName
            : undefined;

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
        staleTime: 60_000,
        gcTime: 5 * 60_000,
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
