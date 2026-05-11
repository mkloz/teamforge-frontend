import type { ReactNode } from "react";

import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";

export interface PageLoadingProps {
  contained?: boolean;
  mode?: "query" | "route";
}

interface GeneratedPageLoadingProps {
  children?: ReactNode;
  fallback?: ReactNode;
  fixture: ReactNode;
  name: string;
}

export function GeneratedPageLoading({
  children,
  fallback,
  fixture,
  name,
}: GeneratedPageLoadingProps) {
  return (
    <GeneratedSkeleton
      name={name}
      loading
      fixture={fixture}
      fallback={fallback ?? null}
    >
      {children ?? fixture}
    </GeneratedSkeleton>
  );
}
