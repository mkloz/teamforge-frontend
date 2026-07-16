import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { operatorRouter } from "@/features/operator/operator-router";

const operatorQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
    mutations: { retry: false, gcTime: 0 },
  },
});

export function OperatorApp() {
  useEffect(() => {
    const clearWhenHidden = () => {
      if (document.visibilityState === "hidden") {
        operatorQueryClient.clear();
      }
    };
    const clearOnPageHide = () => {
      operatorQueryClient.clear();
    };

    document.addEventListener("visibilitychange", clearWhenHidden);
    window.addEventListener("pagehide", clearOnPageHide);
    return () => {
      document.removeEventListener("visibilitychange", clearWhenHidden);
      window.removeEventListener("pagehide", clearOnPageHide);
      operatorQueryClient.clear();
    };
  }, []);

  return (
    <QueryClientProvider client={operatorQueryClient}>
      <RouterProvider router={operatorRouter} />
    </QueryClientProvider>
  );
}
