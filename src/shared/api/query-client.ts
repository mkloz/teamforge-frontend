import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

import { showAppErrorToast } from "@/shared/lib/error-toast";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { telemetryErrorScopes } from "@/shared/lib/telemetry-contract";

const DEFAULT_QUERY_STALE_TIME_MS = 60_000;
const DEFAULT_QUERY_GC_TIME_MS = 5 * 60_000;
const MAX_QUERY_RETRY_FAILURES = 2;
const NON_RETRYABLE_HTTP_STATUSES = new Set([401, 403, 404]);
const DEFAULT_MUTATION_ERROR_TOAST_MESSAGE =
  "That action didn't go through. Please try again.";
const DEFAULT_QUERY_ERROR_TOAST_MESSAGE =
  "We couldn't refresh the latest information. Please try again.";
const DEFAULT_QUERY_ERROR_TOAST_TITLE = "Couldn't refresh this view";

interface ErrorToastMeta {
  errorToastConflictMessage?: string;
  errorToast?: boolean;
  errorToastMessage?: string;
  errorToastTitle?: string;
}

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

function readErrorToastMeta(meta: unknown): ErrorToastMeta {
  if (!meta || typeof meta !== "object") {
    return {};
  }

  const errorToastMeta: ErrorToastMeta = {};

  if (
    "errorToastConflictMessage" in meta &&
    typeof meta.errorToastConflictMessage === "string"
  ) {
    errorToastMeta.errorToastConflictMessage = meta.errorToastConflictMessage;
  }

  if ("errorToast" in meta && typeof meta.errorToast === "boolean") {
    errorToastMeta.errorToast = meta.errorToast;
  }

  if (
    "errorToastMessage" in meta &&
    typeof meta.errorToastMessage === "string"
  ) {
    errorToastMeta.errorToastMessage = meta.errorToastMessage;
  }

  if ("errorToastTitle" in meta && typeof meta.errorToastTitle === "string") {
    errorToastMeta.errorToastTitle = meta.errorToastTitle;
  }

  return errorToastMeta;
}

function getToastId(scope: string, key: unknown) {
  return `${scope}:${JSON.stringify(key)}`;
}

function shouldShowQueryErrorToast(
  hasCachedData: boolean,
  errorToastSetting: boolean | undefined,
) {
  if (errorToastSetting === false) {
    return false;
  }

  return errorToastSetting === true || hasCachedData;
}

export function createAppQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        captureException(telemetryErrorScopes.queryError, error, {
          queryKey: JSON.stringify(query.queryKey),
        });

        const errorToastMeta = readErrorToastMeta(query.meta);

        if (
          shouldShowQueryErrorToast(
            query.state.data !== undefined,
            errorToastMeta.errorToast,
          )
        ) {
          showAppErrorToast(error, {
            fallbackMessage:
              errorToastMeta.errorToastMessage ??
              DEFAULT_QUERY_ERROR_TOAST_MESSAGE,
            id: getToastId("query-error", query.queryKey),
            messageOptions: {
              conflictMessage: errorToastMeta.errorToastConflictMessage,
            },
            title:
              errorToastMeta.errorToastTitle ?? DEFAULT_QUERY_ERROR_TOAST_TITLE,
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const mutationName = getMutationTelemetryName(mutation.meta);
        const errorToastMeta = readErrorToastMeta(mutation.meta);

        captureException(telemetryErrorScopes.mutationError, error, {
          mutationKey: JSON.stringify(mutation.options.mutationKey ?? []),
          mutationName,
        });

        if (mutationName) {
          trackMutationOutcome(mutationName, "error");
        }

        if (errorToastMeta.errorToast !== false) {
          showAppErrorToast(error, {
            fallbackMessage:
              errorToastMeta.errorToastMessage ??
              DEFAULT_MUTATION_ERROR_TOAST_MESSAGE,
            id: getToastId(
              "mutation-error",
              mutation.options.mutationKey ?? mutationName ?? "unknown",
            ),
            messageOptions: {
              conflictMessage: errorToastMeta.errorToastConflictMessage,
            },
            title: errorToastMeta.errorToastTitle,
          });
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
