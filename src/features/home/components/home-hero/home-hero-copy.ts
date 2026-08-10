import type { HomeNextMove } from "@/features/home/lib/home-insights";

export function getGreeting(firstName: string): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return `Good morning, ${firstName}`;
  }

  if (hour < 17) {
    return `Good afternoon, ${firstName}`;
  }

  return `Good evening, ${firstName}`;
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
  if (nextMove.kind !== "planCreation") {
    return nextMove.title;
  }

  return nextMove.eyebrow === "First move"
    ? "Ready for your first planCreation"
    : "Ready to start something new";
}
