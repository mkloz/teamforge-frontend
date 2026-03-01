import { TeamForgeLogo } from "@/assets/logo";
import { useEffect, useRef } from "react";
import { GroupCard } from "./group-card";
import { MbtiCard } from "./mbti-card";
import { TrustCard } from "./trust-card";

export function ForgeOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbContainerRef = useRef<HTMLDivElement>(null);

  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let frame: number;
    // periods in milliseconds - slightly coprime to prevent syncing
    const periods = [13000, 16000, 22000, 28000];
    const baseAngles = [0, 135, 160, 310];

    const animate = (time: number) => {
      const angles = periods.map(
        (p, i) => (baseAngles[i] + ((time % p) / p) * 360) % 360,
      );

      const intensities = angles.map((a1, i) => {
        let sum = 0;
        angles.forEach((a2, j) => {
          if (i === j) return;
          const diff = Math.abs(a1 - a2);
          const shortest = Math.min(diff, 360 - diff);
          if (shortest < 45) {
            const pop = 1 - shortest / 45;
            sum += pop * pop; // quadratic falloff makes intersections pop
          }
        });
        return Math.min(1, sum * 1.5);
      });

      // Instead of relying on React state sorting, we apply z-index directly.
      // We want items with lower intensity to be on top visually.
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        dot.style.transform = `rotate(${angles[i]}deg)`;

        const intensity = intensities[i];

        // Lower intensity = higher z-index so it paints on top
        const zIndex = Math.round((1 - intensity) * 100);
        dot.style.zIndex = zIndex.toString();

        // Teal: 13, 148, 136 -> Amber: 245, 158, 11
        const r = Math.round(13 + (245 - 13) * intensity);
        const g = Math.round(148 + (158 - 148) * intensity);
        const b = Math.round(136 + (11 - 136) * intensity);

        const alphaEnd = 0.85 + 0.15 * intensity;
        const alphaStart = 0.15 + 0.25 * intensity;
        const glowAlpha = 0.5 + 0.5 * intensity;
        const glowSize = 12 + 16 * intensity;

        const color = `rgba(${r}, ${g}, ${b}, 1)`;
        const glowColor = `rgba(${r}, ${g}, ${b}, ${glowAlpha})`;

        dot.style.setProperty("--dot-color", color);
        dot.style.setProperty("--glow-color", glowColor);
        dot.style.setProperty("--glow-size", `${glowSize}px`);

        const tail = tailRefs.current[i];
        if (tail) {
          tail.style.zIndex = zIndex.toString();
          tail.style.transform = `rotate(${angles[i]}deg)`;
          tail.style.setProperty(
            "--tail-color-end",
            `rgba(${r}, ${g}, ${b}, ${alphaEnd})`,
          );
          tail.style.setProperty(
            "--tail-color-start",
            `rgba(${r}, ${g}, ${b}, ${alphaStart})`,
          );
        }
      });

      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const tiltX = (50 - y) / 5;
      const tiltY = (x - 50) / 5;

      if (orbContainerRef.current) {
        orbContainerRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }
    };

    const handleMouseLeave = () => {
      if (orbContainerRef.current) {
        orbContainerRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center animate-hero-fade-in-right delay-300 cursor-default w-full h-full min-h-90 md:min-h-125 px-10 md:pl-32 xl:pl-47 md:pr-25 md:py-20 xl:pr-37 perspective-[600px]"
    >
      <div
        ref={orbContainerRef}
        className="w-[320px] h-80 xl:w-95 xl:h-95 relative transition-transform duration-700 ease-out"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="absolute inset-0 rounded-full blur-[2px] animate-orb-rotate bg-[conic-gradient(from_0deg,rgba(13,148,136,0.25),rgba(20,184,166,0.08),rgba(13,148,136,0.15),rgba(13,148,136,0.25))]"
          aria-hidden="true"
        />

        <div
          className="absolute inset-3 rounded-full animate-orb-pulse bg-[radial-gradient(circle_at_40%_40%,rgba(13,148,136,0.15),rgba(9,9,9,0.95)_70%)]"
          aria-hidden="true"
        />

        <div
          className="absolute inset-4 rounded-full bg-hero-bg border border-white/5 shadow-[inset_0_0_40px_rgba(13,148,136,0.05)]"
          aria-hidden="true"
        />

        {/* The 4 MBTI Data Vectors (Comet Tails) */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={`tail-${i}`}
            className="absolute inset-[8%]"
            ref={(el) => {
              tailRefs.current[i] = el;
            }}
            aria-hidden="true"
            style={
              {
                "--tail-color-end": "rgba(13,148,136,0.85)",
                "--tail-color-start": "rgba(13,148,136,0.15)",
              } as React.CSSProperties
            }
          >
            <div className="absolute inset-0">
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,var(--tail-color-start)_85%,var(--tail-color-end)_100%)] [-webkit-mask-image:radial-gradient(closest-side,transparent_calc(100%-2px),black_calc(100%-1px))] mask-[radial-gradient(closest-side,transparent_calc(100%-2px),black_calc(100%-1px))]" />
            </div>
          </div>
        ))}

        {/* The 4 MBTI Data Vectors (Dots) */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={`dot-${i}`}
            className="absolute inset-[8%]"
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            aria-hidden="true"
            style={
              {
                "--dot-color": "rgba(13,148,136,1)",
                "--glow-color": "rgba(13,148,136,0.5)",
                "--glow-size": "12px",
              } as React.CSSProperties
            }
          >
            <div className="absolute inset-0">
              <div className="absolute w-2 h-2 rounded-full -top-0.75 left-1/2 -translate-x-1/2 bg-(--dot-color) shadow-[0_0_var(--glow-size)_2px_var(--glow-color)] transition-[background-color,box-shadow] duration-100 ease-linear" />
            </div>
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none transform-[translateZ(30px)]">
          {" "}
          <TeamForgeLogo
            className="w-20 h-20 md:w-24 md:h-24 filter drop-shadow-[0_0_16px_rgba(245,158,11,0.25)]"
            showBackground={false}
          />
        </div>

        <div className="absolute -left-10 -top-10 scale-70 sm:scale-85 xl:-left-44 xl:top-4 xl:scale-100 md:-left-30 transform-[translateZ(40px)]">
          {" "}
          <MbtiCard />
        </div>
        <div className="absolute -right-8 -top-12 scale-70 sm:scale-85 xl:-right-30 xl:-top-16 xl:scale-100 md:-right-20 transform-[translateZ(60px)]">
          {" "}
          <GroupCard />
        </div>
        <div className="absolute right-6 -bottom-8 scale-70 sm:scale-85 xl:-right-20 xl:-bottom-16 xl:scale-100 md:-right-10 transform-[translateZ(50px)]">
          {" "}
          <TrustCard />
        </div>
      </div>
    </div>
  );
}
