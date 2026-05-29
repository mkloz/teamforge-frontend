import type { HomeNextMove } from "@/features/home/lib/home-insights";

export function getGreeting(firstName: string): {
  greeting: string;
  sub: string;
} {
  const hour = new Date().getHours();

  if (hour < 12) {
    return {
      greeting: `Good morning, ${firstName}`,
      sub: "What needs a tap before the day gets busy.",
    };
  }

  if (hour < 17) {
    return {
      greeting: `Good afternoon, ${firstName}`,
      sub: "Plans first, fresh openings after.",
    };
  }

  return {
    greeting: `Good evening, ${firstName}`,
    sub: "A quick look before the night gets away.",
  };
}

export function getCompactHeroCopy(nextMove: HomeNextMove): {
  title: string;
  sub: string;
} {
  return {
    title: getCompactHeroTitle(nextMove),
    sub: `${nextMove.eyebrow} · ${nextMove.signal}`,
  };
}

function getCompactHeroTitle(nextMove: HomeNextMove) {
  if (nextMove.kind !== "forge") {
    return nextMove.title;
  }

  return nextMove.eyebrow === "First move"
    ? "Ready for your first forge"
    : "Ready to start something new";
}
