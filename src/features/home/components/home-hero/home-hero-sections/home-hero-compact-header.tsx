import type { ReactNode } from "react";
import { scrollWindowToTop } from "@/shared/lib/scroll-to-top";
import { cn } from "@/shared/lib/utils";

interface HomeHeroCompactHeaderProps {
  isVisible: boolean;
  notificationButton: ReactNode;
  sub: string;
  title: string;
}

export function HomeHeroCompactHeader({
  isVisible,
  notificationButton,
  sub,
  title,
}: HomeHeroCompactHeaderProps) {
  return (
    <div
      aria-hidden={!isVisible}
      inert={!isVisible}
      className={cn(
        "pointer-events-none fixed top-0 right-0 left-0 z-40 md:left-14",
        "transform-[translate3d(0,var(--home-compact-y,-10px),0)] opacity-(--home-compact-opacity) transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
      )}
    >
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-12 lg:px-8 xl:gap-14">
        <div
          className={cn(
            "relative flex h-16 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-b-xl border-border/65 border-b bg-canvas/95 px-4 shadow-sm backdrop-blur sm:h-18 sm:px-5",
            isVisible ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <button
            type="button"
            aria-label="Scroll home to top"
            tabIndex={isVisible ? 0 : -1}
            onClick={scrollWindowToTop}
            className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-inset"
          />

          <div className="pointer-events-none relative z-10 min-w-0">
            <p className="truncate font-bold text-base text-foreground leading-tight tracking-tight sm:text-lg">
              {title}
            </p>
            <p className="mt-0.5 truncate font-medium text-muted-foreground text-xs leading-tight sm:text-sm">
              {sub}
            </p>
          </div>

          <div className="relative z-10 shrink-0">{notificationButton}</div>
        </div>
      </div>
    </div>
  );
}
