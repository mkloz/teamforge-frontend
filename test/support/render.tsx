import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type RenderOptions,
  type RenderResult,
  render,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
}

interface RenderWithQueryClientOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

interface RenderWithQueryClientResult extends RenderResult {
  queryClient: QueryClient;
}

export function renderWithQueryClient(
  ui: ReactElement,
  options: RenderWithQueryClientOptions = {},
): RenderWithQueryClientResult {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    ...render(ui, { ...renderOptions, wrapper: Wrapper }),
    queryClient,
  };
}
