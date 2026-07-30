import { useQueries, useQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  useNavigate,
  useRouteContext,
  useRouterState,
} from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  Menu,
  ServerCog,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { TeamForgeLogo } from "@/assets/logo";
import { clearAdminCache } from "@/features/admin/api/admin-cache";
import { adminPilotOperationsReadinessQueryOptions } from "@/features/admin/api/admin-pilot-operations.api";
import { useAdminCacheLifecycle } from "@/features/admin/hooks/use-admin-cache-lifecycle";
import { operatorQueries } from "@/features/operator/public/operator-queries";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { cn } from "@/shared/lib/utils";
import {
  type AdminNavigationTarget,
  buildAdminNavigation,
} from "@/shared/navigation/admin-navigation";
import { buildHomeNavigation } from "@/shared/navigation/home-navigation";

const ADMIN_METADATA = {
  title: "Admin | TeamForge",
  description: "Private TeamForge moderation and operations workspace.",
};

const ADMIN_NAVIGATION = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    group: "Overview",
  },
  {
    id: "moderation",
    label: "Moderation",
    icon: ShieldCheck,
    group: "Review",
  },
  {
    id: "intake",
    label: "Intake",
    icon: ClipboardList,
    group: "Review",
  },
  {
    id: "workers",
    label: "Workers",
    icon: ServerCog,
    group: "System",
  },
  {
    id: "operations",
    label: "Operations",
    icon: Gauge,
    group: "System",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    group: "Configuration",
  },
] as const satisfies ReadonlyArray<{
  group: "Configuration" | "Overview" | "Review" | "System";
  icon: LucideIcon;
  id: AdminNavigationTarget;
  label: string;
}>;

const ADMIN_NAVIGATION_GROUPS = [
  "Overview",
  "Review",
  "System",
  "Configuration",
] as const;

export function AdminLayout() {
  usePageMetadata(ADMIN_METADATA);
  useAdminCacheLifecycle();

  const navigate = useNavigate();
  const { adminSession } = useRouteContext({ from: "/admin" });
  const currentUserQuery = useCurrentUserQuery();

  useEffect(() => {
    if (currentUserQuery.data?.role === "ADMIN") {
      return;
    }

    if (currentUserQuery.data) {
      clearAdminCache();
      void navigate({ to: "/home", replace: true });
    }
  }, [currentUserQuery.data, navigate]);

  return (
    <div className="min-h-dvh bg-canvas font-sans text-foreground">
      <a
        href="#admin-main"
        className="fixed top-4 left-4 z-100 -translate-y-24 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground opacity-0 transition focus:translate-y-0 focus:opacity-100"
      >
        Skip to admin content
      </a>

      <AdminDesktopNavigation displayName={adminSession.displayName} />
      <AdminMobileHeader displayName={adminSession.displayName} />

      <main id="admin-main" tabIndex={-1} className="min-h-dvh lg:pl-64">
        <Outlet />
      </main>
    </div>
  );
}

function AdminDesktopNavigation({ displayName }: { displayName: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-sidebar-border border-r bg-sidebar lg:flex">
      <AdminBrand />
      <AdminNavigationLinks className="flex-1 px-3 py-4" />
      <AdminSessionFooter displayName={displayName} />
    </aside>
  );
}

function AdminMobileHeader({ displayName }: { displayName: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-border border-b bg-canvas/95 px-4 backdrop-blur lg:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <TeamForgeLogo className="size-8 shrink-0" showBackground={false} />
        <div className="min-w-0">
          <p className="truncate font-bold text-ink text-sm">Admin</p>
          <p className="truncate text-slate-muted text-xs">{displayName}</p>
        </div>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Open admin navigation"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
          <SheetHeader className="text-left">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate between TeamForge administration workspaces.
            </SheetDescription>
          </SheetHeader>
          <AdminNavigationLinks className="mt-5 flex-1" mobile />
          <AdminSessionFooter displayName={displayName} mobile />
        </SheetContent>
      </Sheet>
    </header>
  );
}

function AdminBrand() {
  return (
    <div className="border-sidebar-border border-b p-4">
      <Link
        {...buildAdminNavigation()}
        className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
      >
        <TeamForgeLogo className="size-9" showBackground={false} />
        <span>
          <span className="block font-bold text-ink text-sm">TeamForge</span>
          <span className="block text-slate-muted text-xs">Admin</span>
        </span>
      </Link>
    </div>
  );
}

function AdminNavigationLinks({
  className,
  mobile = false,
}: {
  className?: string;
  mobile?: boolean;
}) {
  const pathname = useRouterState({
    select: (state) => (state.resolvedLocation ?? state.location).pathname,
  });
  const moderationQueueQueries = useQueries({
    queries: [
      operatorQueries.cases({
        queue: "CRITICAL_NOW",
        page: 1,
        limit: 1,
      }),
      operatorQueries.cases({
        queue: "HUMAN_REQUIRED",
        page: 1,
        limit: 1,
      }),
      operatorQueries.cases({
        queue: "APPEALS",
        page: 1,
        limit: 1,
      }),
    ],
  });
  const intakeQuery = useQuery(operatorQueries.intake({ page: 1, limit: 1 }));
  const workersQuery = useQuery(operatorQueries.workers());
  const readinessQuery = useQuery(adminPilotOperationsReadinessQueryOptions());
  const moderationTotal = moderationQueueQueries.reduce(
    (total, query) => total + (query.data?.total ?? 0),
    0,
  );

  return (
    <nav
      aria-label="Admin navigation"
      className={cn("grid content-start gap-5", className)}
    >
      {ADMIN_NAVIGATION_GROUPS.map((group) => {
        const items = ADMIN_NAVIGATION.filter((item) => item.group === group);
        return (
          <div key={group} className="grid gap-1">
            {group !== "Overview" ? (
              <p className="px-3 pb-1 font-semibold text-slate-muted text-xs">
                {group}
              </p>
            ) : null}
            {items.map((item) => {
              const Icon = item.icon;
              const active = isAdminNavigationActive(item.id, pathname);
              const signal = getNavigationSignal({
                id: item.id,
                intakeTotal: intakeQuery.data?.total ?? 0,
                moderationTotal,
                operationsBlocked: readinessQuery.data?.status === "BLOCKED",
                workersDegraded:
                  workersQuery.data?.workers.some(
                    (worker) => worker.state !== "HEALTHY",
                  ) ?? false,
              });
              const link = (
                <Link
                  key={item.id}
                  {...buildAdminNavigation(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                    active
                      ? "bg-primary/8 text-primary before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
                      : "text-slate-muted hover:bg-muted/55 hover:text-ink",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 truncate font-semibold text-sm">
                    {item.label}
                  </span>
                  {signal ? (
                    signal.kind === "count" ? (
                      <span
                        className={cn(
                          "ml-auto min-w-6 rounded-full px-1.5 py-0.5 text-center font-semibold text-xs tabular-nums",
                          signal.tone === "danger"
                            ? "bg-danger/12 text-danger"
                            : "bg-accent/12 text-accent",
                        )}
                      >
                        {signal.value > 99 ? "99+" : signal.value}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "ml-auto size-2 rounded-full",
                          signal.tone === "danger" ? "bg-danger" : "bg-accent",
                        )}
                        aria-hidden="true"
                        title={signal.label}
                      />
                    )
                  ) : null}
                  {signal?.kind === "status" ? (
                    <span className="sr-only">{signal.label}</span>
                  ) : null}
                </Link>
              );

              return mobile ? (
                <SheetClose key={item.id} asChild>
                  {link}
                </SheetClose>
              ) : (
                <div key={item.id}>{link}</div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

type NavigationSignal =
  | { kind: "count"; tone: "danger" | "warning"; value: number }
  | { kind: "status"; label: string; tone: "danger" | "warning" };

function getNavigationSignal({
  id,
  intakeTotal,
  moderationTotal,
  operationsBlocked,
  workersDegraded,
}: {
  id: AdminNavigationTarget;
  intakeTotal: number;
  moderationTotal: number;
  operationsBlocked: boolean;
  workersDegraded: boolean;
}): NavigationSignal | null {
  if (id === "moderation" && moderationTotal > 0) {
    return { kind: "count", tone: "danger", value: moderationTotal };
  }
  if (id === "intake" && intakeTotal > 0) {
    return { kind: "count", tone: "warning", value: intakeTotal };
  }
  if (id === "workers" && workersDegraded) {
    return {
      kind: "status",
      label: "Worker attention needed",
      tone: "warning",
    };
  }
  if (id === "operations" && operationsBlocked) {
    return {
      kind: "status",
      label: "Operations blocked",
      tone: "danger",
    };
  }
  return null;
}

function AdminSessionFooter({
  displayName,
  mobile = false,
}: {
  displayName: string;
  mobile?: boolean;
}) {
  const content = (
    <Link
      {...buildHomeNavigation()}
      className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-muted text-sm transition-colors hover:bg-muted/55 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to TeamForge
    </Link>
  );

  return (
    <div className="border-sidebar-border border-t p-3">
      <p className="truncate px-3 pb-2 text-slate-muted text-xs">
        Signed in as {displayName}
      </p>
      {mobile ? <SheetClose asChild>{content}</SheetClose> : content}
    </div>
  );
}

function isAdminNavigationActive(
  target: AdminNavigationTarget,
  pathname: string,
) {
  if (target === "overview") {
    return pathname === "/admin" || pathname === "/admin/";
  }

  if (target === "moderation") {
    return (
      pathname === "/admin/moderation" ||
      pathname.startsWith("/admin/moderation/cases/")
    );
  }

  return pathname === buildAdminNavigation(target).to;
}
