import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { lazy, Suspense } from "react";
import { useDesktopAuthVisualEnabled } from "@/features/auth/hooks/use-desktop-auth-visual-enabled";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { Button } from "@/shared/components/ui/button";
import { voronoiSplitDividerClassName } from "@/shared/components/visuals/voronoi-split-divider";
import { cn } from "@/shared/lib/utils";
import type { VoronoiCatalystHandle } from "@/shared/lib/voronoi/voronoi-contract";

const LazyVoronoiCatalyst = lazy(() =>
  import("@/shared/components/visuals/voronoi-catalyst").then((module) => ({
    default: module.VoronoiCatalyst,
  })),
);

interface AuthPageContentProps {
  catalystRef?: RefObject<VoronoiCatalystHandle | null>;
  children: ReactNode;
  onInput?: () => void;
  progress: number;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function AuthPageContent({
  catalystRef,
  children,
  onInput,
  progress,
  scrollContainerRef,
}: AuthPageContentProps) {
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
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
            />
            <span className="font-medium text-xs">Back home</span>
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
            <LazyVoronoiCatalyst ref={catalystRef} progress={progress} />
          </Suspense>
        ) : null}
      </div>

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <BackgroundTexture />
        <TopProgressBar
          progress={progress}
          className="absolute top-0 right-0 left-0 z-50 w-full"
        />

        <div
          ref={scrollContainerRef}
          className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth pb-4"
          onInput={onInput}
        >
          <div className="flex min-h-full w-full flex-col items-center justify-start px-4 pt-20 pb-10 lg:justify-center lg:py-8">
            <div className="relative w-full max-w-sm px-2 sm:px-10 lg:p-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
