import type { CSSProperties } from "react";
import { useRef } from "react";
import { FindafewLogo } from "@/assets/logo";
import { usePrefersReducedMotion } from "@/shared/hooks/use-prefers-reduced-motion";
import { GroupCard } from "./group-card";
import { PlanDetailsCard } from "./plan-details-card";
import { TrustCard } from "./trust-card";
import { useGroupConvergenceVisualAnimation } from "./use-plan-creation-orb-animation";
import { useGroupConvergenceVisualTilt } from "./use-plan-creation-orb-tilt";

export function GroupConvergenceVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbContainerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = usePrefersReducedMotion();

  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGroupConvergenceVisualAnimation(dotRefs, tailRefs, shouldReduceMotion);
  const tiltHandlers = useGroupConvergenceVisualTilt({
    containerRef,
    orbContainerRef,
    shouldReduceMotion,
  });

  return (
    <div
      ref={containerRef}
      {...tiltHandlers}
      aria-hidden="true"
      className="perspective-orb relative flex size-full min-h-72 cursor-default items-center justify-center px-3 pt-4 pb-2 sm:min-h-82 sm:px-8 md:min-h-125 md:py-20 md:pr-25 md:pl-32 xl:pr-37 xl:pl-47"
    >
      <div
        ref={orbContainerRef}
        className="relative size-64 transition-transform duration-700 ease-out sm:size-80 xl:h-95 xl:w-95"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="absolute inset-0 animate-plan-creation-orb-rotate rounded-full bg-[conic-gradient(from_0deg,rgba(13,148,136,0.25),rgba(13,148,136,0.08),rgba(13,148,136,0.15),rgba(13,148,136,0.25))] blur-subtle motion-reduce:animate-none"
          aria-hidden="true"
        />

        <div
          className="absolute inset-3 animate-plan-creation-orb-breathe rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(13,148,136,0.15),rgba(9,9,9,0.95)_70%)] motion-reduce:animate-none"
          aria-hidden="true"
        />

        <div
          className="absolute inset-4 rounded-full border border-white/5 bg-hero-bg shadow-[inset_0_0_40px_rgba(13,148,136,0.05)]"
          aria-hidden="true"
        />

        {[0, 1, 2, 3].map((i) => {
          return (
            <DataVectorTail
              key={`tail-${i}`}
              ref={(el) => {
                tailRefs.current[i] = el;
              }}
            />
          );
        })}

        {[0, 1, 2, 3].map((i) => {
          return (
            <DataVectorDot
              key={`dot-${i}`}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
            />
          );
        })}

        <div className="transform-[translateZ(30px)] pointer-events-none absolute inset-0 flex items-center justify-center">
          <FindafewLogo
            className="filter-[drop-shadow(0_0_16px_rgba(245,158,11,0.25))] size-20 md:h-24 md:w-24"
            showBackground={false}
          />
        </div>

        <div className="transform-[translateZ(40px)] absolute -top-10 -left-10 scale-70 sm:scale-85 md:-left-30 xl:top-4 xl:-left-44 xl:scale-100">
          <PlanDetailsCard />
        </div>
        <div className="transform-[translateZ(60px)] absolute -top-12 -right-8 scale-70 sm:scale-85 md:-right-20 xl:-top-16 xl:-right-30 xl:scale-100">
          <GroupCard />
        </div>
        <div className="transform-[translateZ(50px)] absolute right-6 -bottom-8 scale-70 sm:scale-85 md:-right-10 xl:-right-20 xl:-bottom-16 xl:scale-100">
          <TrustCard />
        </div>
      </div>
    </div>
  );
}

function DataVectorTail({
  ref,
}: {
  ref: (node: HTMLDivElement | null) => void;
}) {
  const tailStyle: CSSProperties & Record<string, string> = {
    "--tail-color-end": "rgba(13,148,136,0.85)",
    "--tail-color-start": "rgba(13,148,136,0.15)",
  };

  return (
    <div
      ref={ref}
      className="absolute inset-[8%]"
      aria-hidden="true"
      style={tailStyle}
    >
      <div className="absolute inset-0">
        <div className="mask-[radial-gradient(closest-side,transparent_calc(100%-2px),black_calc(100%-1px))] absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,var(--tail-color-start)_85%,var(--tail-color-end)_100%)] [-webkit-mask-image:radial-gradient(closest-side,transparent_calc(100%-2px),black_calc(100%-1px))]" />
      </div>
    </div>
  );
}

function DataVectorDot({
  ref,
}: {
  ref: (node: HTMLDivElement | null) => void;
}) {
  const dotStyle: CSSProperties & Record<string, string> = {
    "--dot-color": "rgba(13,148,136,1)",
    "--glow-color": "rgba(13,148,136,0.5)",
    "--glow-size": "12px",
  };

  return (
    <div
      ref={ref}
      className="absolute inset-[8%]"
      aria-hidden="true"
      style={dotStyle}
    >
      <div className="absolute inset-0">
        <div className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-(--dot-color) shadow-[0_0_var(--glow-size)_2px_var(--glow-color)] transition-[background-color,box-shadow] duration-100 ease-linear" />
      </div>
    </div>
  );
}
