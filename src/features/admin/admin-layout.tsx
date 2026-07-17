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
  Gauge,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { TeamForgeLogo } from "@/assets/logo";
import { clearAdminCache } from "@/features/admin/api/admin-cache";
import { useAdminCacheLifecycle } from "@/features/admin/hooks/use-admin-cache-lifecycle";
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
    description: "What needs attention",
    icon: LayoutDashboard,
  },
  {
    id: "moderation",
    label: "Moderation",
    description: "Human review queue",
    icon: ShieldCheck,
  },
  {
    id: "operations",
    label: "Operations",
    description: "Workers and failures",
    icon: Gauge,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Policy and rollout",
    icon: Settings,
  },
] as const satisfies ReadonlyArray<{
  description: string;
  icon: LucideIcon;
  id: AdminNavigationTarget;
  label: string;
}>;

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
            <SheetDescription>
              Review moderation exceptions and system health.
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

  return (
    <nav
      aria-label="Admin navigation"
      className={cn("grid content-start gap-1", className)}
    >
      {ADMIN_NAVIGATION.map((item) => {
        const Icon = item.icon;
        const active = isAdminNavigationActive(item.id, pathname);
        const link = (
          <Link
            key={item.id}
            {...buildAdminNavigation(item.id)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
              active
                ? "bg-primary/8 text-primary"
                : "text-slate-muted hover:bg-muted/55 hover:text-ink",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-sm">
                {item.label}
              </span>
              <span className="block truncate text-xs opacity-80">
                {item.description}
              </span>
            </span>
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
    </nav>
  );
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
