import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { useRef } from "react";
import { TeamForgeLogo } from "@/assets/logo";
import { GroupCard } from "./group-card";
import { MbtiCard } from "./mbti-card";
import { TrustCard } from "./trust-card";
import { useForgeOrbAnimation } from "./use-forge-orb-animation";
import { useForgeOrbTilt } from "./use-forge-orb-tilt";

export function ForgeOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbContainerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useForgeOrbAnimation(dotRefs, tailRefs, shouldReduceMotion);
  const tiltHandlers = useForgeOrbTilt({
    containerRef,
    orbContainerRef,
    shouldReduceMotion,
  });

  return (
    <div
      ref={containerRef}
      {...tiltHandlers}
      className="relative flex h-full min-h-90 w-full cursor-default items-center justify-center px-10 perspective-orb md:min-h-125 md:py-20 md:pr-25 md:pl-32 xl:pr-37 xl:pl-47"
    >
      <div
        ref={orbContainerRef}
        className="relative h-80 w-80 transition-transform duration-700 ease-out xl:h-95 xl:w-95"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 20, repeat: Infinity, ease: "linear" }
          }
          className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(13,148,136,0.25),rgba(20,184,166,0.08),rgba(13,148,136,0.15),rgba(13,148,136,0.25))] blur-subtle"
          aria-hidden="true"
        />

        <motion.div
          animate={
            shouldReduceMotion
              ? { scale: 1, opacity: 0.8 }
              : { scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
          className="absolute inset-3 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(13,148,136,0.15),rgba(9,9,9,0.95)_70%)]"
          aria-hidden="true"
        />

        <div
          className="absolute inset-4 rounded-full border border-white/5 bg-hero-bg shadow-[inset_0_0_40px_rgba(13,148,136,0.05)]"
          aria-hidden="true"
        />

        {/* The 4 MBTI Data Vectors (Comet Tails) */}
        {[0, 1, 2, 3].map((i) => {
          const tailStyle: CSSProperties & Record<string, string> = {
            "--tail-color-end": "rgba(13,148,136,0.85)",
            "--tail-color-start": "rgba(13,148,136,0.15)",
          };

          return (
            <div
              key={`tail-${i}`}
              className="absolute inset-[8%]"
              ref={(el) => {
                tailRefs.current[i] = el;
              }}
              aria-hidden="true"
              style={tailStyle}
            >
              <div className="absolute inset-0">
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,var(--tail-color-start)_85%,var(--tail-color-end)_100%)] mask-[radial-gradient(closest-side,transparent_calc(100%-2px),black_calc(100%-1px))] [-webkit-mask-image:radial-gradient(closest-side,transparent_calc(100%-2px),black_calc(100%-1px))]" />
              </div>
            </div>
          );
        })}

        {/* The 4 MBTI Data Vectors (Dots) */}
        {[0, 1, 2, 3].map((i) => {
          const dotStyle: CSSProperties & Record<string, string> = {
            "--dot-color": "rgba(13,148,136,1)",
            "--glow-color": "rgba(13,148,136,0.5)",
            "--glow-size": "12px",
          };

          return (
            <div
              key={`dot-${i}`}
              className="absolute inset-[8%]"
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              aria-hidden="true"
              style={dotStyle}
            >
              <div className="absolute inset-0">
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-(--dot-color) shadow-[0_0_var(--glow-size)_2px_var(--glow-color)] transition-[background-color,box-shadow] duration-100 ease-linear" />
              </div>
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-0 flex transform-[translateZ(30px)] items-center justify-center">
          <TeamForgeLogo
            className="h-20 w-20 drop-shadow-[0_0_16px_rgba(245,158,11,0.25)] filter md:h-24 md:w-24"
            showBackground={false}
          />
        </div>

        <div className="absolute -top-10 -left-10 scale-70 transform-[translateZ(40px)] sm:scale-85 md:-left-30 xl:top-4 xl:-left-44 xl:scale-100">
          <MbtiCard />
        </div>
        <div className="absolute -top-12 -right-8 scale-70 transform-[translateZ(60px)] sm:scale-85 md:-right-20 xl:-top-16 xl:-right-30 xl:scale-100">
          <GroupCard />
        </div>
        <div className="absolute right-6 -bottom-8 scale-70 transform-[translateZ(50px)] sm:scale-85 md:-right-10 xl:-right-20 xl:-bottom-16 xl:scale-100">
          <TrustCard />
        </div>
      </div>
    </div>
  );
}
