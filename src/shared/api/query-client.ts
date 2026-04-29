import { QueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

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
