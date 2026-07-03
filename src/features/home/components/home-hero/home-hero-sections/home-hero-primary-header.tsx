import type { ReactNode } from "react";

interface HomeHeroPrimaryHeaderProps {
  greeting: string;
  notificationButton: ReactNode;
  sub: string;
}

export function HomeHeroPrimaryHeader({
  greeting,
  notificationButton,
  sub,
}: HomeHeroPrimaryHeaderProps) {
  return (
    <div className="transform-[translate3d(0,var(--home-hero-original-y,0px),0)] flex items-start justify-between gap-3 opacity-(--home-hero-original-opacity,1) transition-[opacity,transform] duration-300 ease-out [transition-delay:var(--home-hero-original-delay,0ms)] motion-reduce:transition-none">
      <div className="min-w-0 flex-1">
        <h1
          id="home-hero-heading"
          className="font-extrabold text-foreground text-xl leading-tight tracking-tight sm:text-2xl md:text-3xl lg:text-4xl"
        >
          {greeting}
        </h1>
        <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed md:text-base">
          {sub}
        </p>
      </div>

      {notificationButton}
    </div>
  );
}
