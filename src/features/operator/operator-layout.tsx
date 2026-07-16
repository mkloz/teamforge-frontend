import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet } from "@tanstack/react-router";
import { Gauge, Inbox, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import {
  OPERATOR_QUERY_KEYS,
  operatorQueries,
} from "@/features/operator/api/operator-queries";
import {
  OperatorAccessState,
  OperatorLoading,
} from "@/features/operator/components/operator-states";

export function OperatorLayout() {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery(operatorQueries.session());

  useEffect(() => {
    if (!sessionQuery.isError) return;
    queryClient.removeQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === OPERATOR_QUERY_KEYS.all[0] &&
        queryKey[1] === OPERATOR_QUERY_KEYS.all[1] &&
        queryKey[2] !== "session",
    });
    queryClient.getMutationCache().clear();
  }, [queryClient, sessionQuery.isError]);

  if (sessionQuery.isLoading) return <OperatorLoading />;
  if (sessionQuery.isError || !sessionQuery.data) {
    return (
      <OperatorAccessState
        error={sessionQuery.error}
        onRetry={() => void sessionQuery.refetch()}
      />
    );
  }

  const session = sessionQuery.data;
  return (
    <div className="min-h-dvh bg-canvas text-foreground">
      <header className="border-border border-b bg-card">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 md:px-8">
          <Link
            to="/operator"
            search={{ queue: "CRITICAL_NOW" }}
            className="flex items-center gap-3"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-bold text-ink text-sm">
                TeamForge Operator
              </span>
              <span className="hidden text-slate-muted text-xs sm:block">
                Safety review workspace
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {session.roles.includes("OWNER_ADMIN") && !session.breakGlass ? (
              <>
                <Link
                  to="/operator/intake"
                  aria-label="Unassigned intake"
                  className="flex size-9 items-center justify-center rounded-full font-semibold text-primary text-sm hover:bg-primary/8 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-3"
                >
                  <Inbox className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Intake</span>
                </Link>
                <Link
                  to="/operator/operations"
                  aria-label="Worker operations"
                  className="flex size-9 items-center justify-center rounded-full font-semibold text-primary text-sm hover:bg-primary/8 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-3"
                >
                  <Gauge className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Operations</span>
                </Link>
              </>
            ) : null}
            <span className="hidden rounded-full bg-muted px-3 py-1 font-semibold text-slate-muted text-xs sm:inline">
              {session.displayName}
            </span>
          </div>
        </div>
      </header>
      <main id="operator-main" className="min-h-[calc(100dvh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}
