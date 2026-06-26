import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { isApiNetworkError } from "@/shared/api/api-network-error";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import type { AppErrorToastOptions } from "@/shared/lib/error-toast";
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
  const status = getHttpErrorStatus(error);

  return status !== null && NON_RETRYABLE_HTTP_STATUSES.has(status);
}

function shouldRetry(failureCount: number, error: unknown) {
  if (isApiNetworkError(error)) {
    return false;
  }

  if (isNonRetryableHttpError(error)) {
    return false;
  }

  return failureCount < MAX_QUERY_RETRY_FAILURES;
}

function getMutationTelemetryName(mutationMeta: unknown) {
  const meta = readObjectMeta(mutationMeta);

  return meta ? readStringMetaValue(meta, "telemetryName") : undefined;
}

function isObjectMeta(meta: unknown): meta is Record<string, unknown> {
  return Boolean(meta) && typeof meta === "object";
}

function readObjectMeta(meta: unknown) {
  return isObjectMeta(meta) ? meta : null;
}

function readStringMetaValue(meta: Record<string, unknown>, key: string) {
  const value = meta[key];

  return typeof value === "string" ? value : undefined;
}

function readBooleanMetaValue(meta: Record<string, unknown>, key: string) {
  const value = meta[key];

  return typeof value === "boolean" ? value : undefined;
}

function readErrorToastMeta(meta: unknown): ErrorToastMeta {
  const errorMeta = readObjectMeta(meta);

  if (!errorMeta) {
    return {};
  }

  return {
    errorToastConflictMessage: readStringMetaValue(
      errorMeta,
      "errorToastConflictMessage",
    ),
    errorToast: readBooleanMetaValue(errorMeta, "errorToast"),
    errorToastMessage: readStringMetaValue(errorMeta, "errorToastMessage"),
    errorToastTitle: readStringMetaValue(errorMeta, "errorToastTitle"),
  };
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

async function captureQueryClientException(
  scope: string,
  error: unknown,
  context: Record<string, string | undefined>,
) {
  try {
    const { captureException } = await import("@/shared/lib/telemetry");

    captureException(scope, error, context);
  } catch (telemetryError) {
    warnInDevelopment("Query telemetry failed.", telemetryError);
  }
}

async function trackMutationError(name: string) {
  try {
    const { trackMutationOutcome } = await import("@/shared/lib/telemetry");

    trackMutationOutcome(name, "error");
  } catch (telemetryError) {
    warnInDevelopment("Mutation telemetry failed.", telemetryError);
  }
}

async function showDeferredAppErrorToast(
  error: unknown,
  options: AppErrorToastOptions,
) {
  try {
    const { showAppErrorToast } = await import("@/shared/lib/error-toast");

    showAppErrorToast(error, options);
  } catch (toastError) {
    warnInDevelopment("Error toast failed.", toastError);
  }
}

function getQueryErrorToastOptions(
  errorToastMeta: ErrorToastMeta,
  queryKey: unknown,
): AppErrorToastOptions {
  return {
    fallbackMessage:
      errorToastMeta.errorToastMessage ?? DEFAULT_QUERY_ERROR_TOAST_MESSAGE,
    id: getToastId("query-error", queryKey),
    messageOptions: {
      conflictMessage: errorToastMeta.errorToastConflictMessage,
    },
    title: errorToastMeta.errorToastTitle ?? DEFAULT_QUERY_ERROR_TOAST_TITLE,
  };
}

function getMutationErrorToastOptions(
  errorToastMeta: ErrorToastMeta,
  mutationKey: unknown,
  mutationName: string | undefined,
): AppErrorToastOptions {
  return {
    fallbackMessage:
      errorToastMeta.errorToastMessage ?? DEFAULT_MUTATION_ERROR_TOAST_MESSAGE,
    id: getToastId("mutation-error", mutationKey ?? mutationName ?? "unknown"),
    messageOptions: {
      conflictMessage: errorToastMeta.errorToastConflictMessage,
    },
    title: errorToastMeta.errorToastTitle,
  };
}

function createAppQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isApiNetworkError(error)) {
          return;
        }

        void captureQueryClientException(
          telemetryErrorScopes.queryError,
          error,
          {
            queryKey: JSON.stringify(query.queryKey),
          },
        );

        const errorToastMeta = readErrorToastMeta(query.meta);

        if (
          shouldShowQueryErrorToast(
            query.state.data !== undefined,
            errorToastMeta.errorToast,
          )
        ) {
          void showDeferredAppErrorToast(
            error,
            getQueryErrorToastOptions(errorToastMeta, query.queryKey),
          );
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const mutationName = getMutationTelemetryName(mutation.meta);
        const errorToastMeta = readErrorToastMeta(mutation.meta);

        void captureQueryClientException(
          telemetryErrorScopes.mutationError,
          error,
          {
            mutationKey: JSON.stringify(mutation.options.mutationKey ?? []),
            mutationName,
          },
        );

        if (mutationName) {
          void trackMutationError(mutationName);
        }

        if (errorToastMeta.errorToast !== false) {
          void showDeferredAppErrorToast(
            error,
            getMutationErrorToastOptions(
              errorToastMeta,
              mutation.options.mutationKey,
              mutationName,
            ),
          );
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
