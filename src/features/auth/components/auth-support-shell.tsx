import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { lazy, Suspense } from "react";

import { useDesktopAuthVisualEnabled } from "@/features/auth/hooks/use-desktop-auth-visual-enabled";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { Button } from "@/shared/components/ui/button";
import { voronoiSplitDividerClassName } from "@/shared/components/visuals/voronoi-split-divider";
import { cn } from "@/shared/lib/utils";
import type { VoronoiFormationTarget } from "@/shared/lib/voronoi/voronoi-contract";

const LazyVoronoiCatalyst = lazy(() =>
  import("@/shared/components/visuals/voronoi-catalyst").then((module) => ({
    default: module.VoronoiCatalyst,
  })),
);

const SUPPORT_FORMATION = {
  kind: "text",
  value: "WE ARE HERE",
} as const satisfies VoronoiFormationTarget;

interface AuthSupportShellProps {
  title: string;
  description?: string;
  backNavigation: {
    to: "/auth/login" | "/auth/register" | "/auth/forgot-password";
    search?: {
      returnTo: string;
    };
  };
  backLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  progress: number;
}

export function AuthSupportShell({
  title,
  description,
  backNavigation,
  backLabel,
  children,
  footer,
  progress,
}: AuthSupportShellProps) {
  const isDesktopAuthVisualEnabled = useDesktopAuthVisualEnabled();

  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-30 flex h-16 items-center px-4 lg:h-24 lg:px-10">
        <Button
          variant="inverseGhost"
          asChild
          size="sm"
          className="pointer-events-auto"
        >
          <Link {...backNavigation} className="flex items-center gap-2">
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
            />
            <span className="font-medium text-xs">{backLabel}</span>
          </Link>
        </Button>
      </div>

      <div
        className={cn(
          "relative hidden h-full flex-1 items-center justify-center overflow-hidden border-r bg-hero-bg lg:flex",
          voronoiSplitDividerClassName,
        )}
      >
        {isDesktopAuthVisualEnabled ? (
          <Suspense fallback={null}>
            <LazyVoronoiCatalyst
              formation={SUPPORT_FORMATION}
              progress={progress}
            />
          </Suspense>
        ) : null}
      </div>

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <BackgroundTexture />

        <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-4 pb-4">
          <div className="flex min-h-full w-full flex-col items-center justify-center pt-20 pb-10 lg:py-8">
            <div className="w-full max-w-sm px-2 sm:px-0">
              <div className="flex flex-col gap-2 text-center">
                <h1 className="font-semibold text-2xl text-foreground tracking-tight">
                  {title}
                </h1>
                {description ? (
                  <p className="text-slate-muted text-sm leading-6">
                    {description}
                  </p>
                ) : null}
              </div>

              <div className="mt-6">{children}</div>

              {footer ? <div className="mt-6">{footer}</div> : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
