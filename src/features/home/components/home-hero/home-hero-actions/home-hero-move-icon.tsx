import {
  CalendarCheck2,
  Compass,
  Flame,
  type LucideIcon,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type { HomeNextMove } from "@/features/home/lib/home-insights";

interface HomeHeroMoveIconProps {
  kind: HomeNextMove["kind"];
  className?: string;
}

type HomeMoveKind = HomeNextMove["kind"];

const HOME_HERO_MOVE_ICONS: Record<HomeMoveKind, LucideIcon> = {
  forge: Flame,
  invitation: Mail,
  plan: CalendarCheck2,
  profile: ShieldCheck,
  recommendation: Compass,
};

export function HomeHeroMoveIcon({ kind, className }: HomeHeroMoveIconProps) {
  const Icon = HOME_HERO_MOVE_ICONS[kind];

  return <Icon className={className} aria-hidden="true" />;
}
