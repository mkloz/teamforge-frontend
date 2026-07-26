import type { ReactNode } from "react";

interface HomeHeroPrimaryHeaderProps {
  greeting: string;
  notificationButton: ReactNode;
}

export function HomeHeroPrimaryHeader({
  greeting,
  notificationButton,
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
      </div>

      {notificationButton}
    </div>
  );
}
