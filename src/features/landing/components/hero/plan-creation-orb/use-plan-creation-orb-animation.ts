import type { RefObject } from "react";
import { useEffect } from "react";

const ORBIT_PERIODS = [13000, 16000, 22000, 28000] as const;
const BASE_ANGLES = [0, 135, 160, 310] as const;
const POP_ANGLE_THRESHOLD = 45;

type OrbRefs = RefObject<(HTMLDivElement | null)[]>;

function getOrbitAngles(time: number) {
  return ORBIT_PERIODS.map(
    (period, index) =>
      (BASE_ANGLES[index] + ((time % period) / period) * 360) % 360,
  );
}

function getOrbitIntensities(angles: number[]) {
  return angles.map((angle, index) => {
    let intensity = 0;

    angles.forEach((nextAngle, nextIndex) => {
      if (index === nextIndex) {
        return;
      }

      const diff = Math.abs(angle - nextAngle);
      const shortest = Math.min(diff, 360 - diff);

      if (shortest < POP_ANGLE_THRESHOLD) {
        const pop = 1 - shortest / POP_ANGLE_THRESHOLD;
        intensity += pop * pop;
      }
    });

    return Math.min(1, intensity * 1.5);
  });
}

function getOrbColor(intensity: number) {
  const red = Math.round(13 + (245 - 13) * intensity);
  const green = Math.round(148 + (158 - 148) * intensity);
  const blue = Math.round(136 + (11 - 136) * intensity);

  return { blue, green, red };
}

export function useGroupConvergenceVisualAnimation(
  dotRefs: OrbRefs,
  tailRefs: OrbRefs,
  shouldReduceMotion: boolean | null,
) {
  useEffect(() => {
    if (shouldReduceMotion) {
      return undefined;
    }

    let frame: number;

    const animate = (time: number) => {
      const angles = getOrbitAngles(time);
      const intensities = getOrbitIntensities(angles);

      dotRefs.current.forEach((dot, index) => {
        if (!dot) {
          return;
        }

        const angle = angles[index];
        const intensity = intensities[index];
        const { blue, green, red } = getOrbColor(intensity);
        const zIndex = Math.round((1 - intensity) * 100);
        const alphaEnd = 0.85 + 0.15 * intensity;
        const alphaStart = 0.15 + 0.25 * intensity;
        const glowAlpha = 0.5 + 0.5 * intensity;
        const glowSize = 12 + 16 * intensity;

        dot.style.transform = `rotate(${angle}deg)`;
        dot.style.zIndex = zIndex.toString();
        dot.style.setProperty(
          "--dot-color",
          `rgba(${red}, ${green}, ${blue}, 1)`,
        );
        dot.style.setProperty(
          "--glow-color",
          `rgba(${red}, ${green}, ${blue}, ${glowAlpha})`,
        );
        dot.style.setProperty("--glow-size", `${glowSize}px`);

        const tail = tailRefs.current[index];

        if (tail) {
          tail.style.zIndex = zIndex.toString();
          tail.style.transform = `rotate(${angle}deg)`;
          tail.style.setProperty(
            "--tail-color-end",
            `rgba(${red}, ${green}, ${blue}, ${alphaEnd})`,
          );
          tail.style.setProperty(
            "--tail-color-start",
            `rgba(${red}, ${green}, ${blue}, ${alphaStart})`,
          );
        }
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [dotRefs, shouldReduceMotion, tailRefs]);
}
