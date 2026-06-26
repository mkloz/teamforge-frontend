import { Button } from "@/shared/components/ui/button";
import { IconTile, type IconTileTone } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

import type { ModeButtonProps } from "./types";

type ModeActiveColor = ModeButtonProps["activeColor"];

function getActiveModeButtonClassName(activeColor: ModeActiveColor) {
  return activeColor === "primary"
    ? "border-forge-teal/55 bg-forge-teal/10 text-forge-teal shadow-sm ring-1 ring-forge-teal/20"
    : "border-spark-amber/55 bg-spark-amber/10 text-spark-amber shadow-sm ring-1 ring-spark-amber/20";
}

function getModeButtonClassName(active: boolean, activeColor: ModeActiveColor) {
  return cn(
    "group relative h-auto min-w-0 flex-col items-start justify-start gap-2 overflow-hidden whitespace-normal rounded-lg border p-3 text-left transition-colors duration-200",
    active
      ? getActiveModeButtonClassName(activeColor)
      : "border-border/45 bg-card/70 shadow-xs hover:border-forge-teal/25 hover:bg-forge-teal/5",
  );
}

function getModeIconTone(
  active: boolean,
  activeColor: ModeActiveColor,
): IconTileTone {
  if (!active) {
    return "neutral";
  }

  return activeColor === "primary" ? "teal" : "amber";
}

function getModeIconClassName(active: boolean, activeColor: ModeActiveColor) {
  if (!active) {
    return "bg-muted";
  }

  return activeColor === "primary"
    ? "bg-forge-teal text-white shadow-forge-teal/25 shadow-sm"
    : "bg-spark-amber/15 text-spark-amber shadow-sm ring-1 ring-spark-amber/20";
}

function getModeTitleClassName(active: boolean, activeColor: ModeActiveColor) {
  return cn(
    "min-w-0 text-wrap font-black text-sm leading-5 tracking-tight",
    active
      ? activeColor === "primary"
        ? "text-forge-teal"
        : "text-spark-amber"
      : "text-foreground",
  );
}

export function ModeButton({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  activeColor,
}: ModeButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={getModeButtonClassName(active, activeColor)}
      contentClassName="min-w-0 flex-col items-start justify-start gap-2 whitespace-normal"
    >
      <div className="flex min-w-0 items-center gap-2">
        <IconTile
          icon={Icon}
          size="xs"
          tone={getModeIconTone(active, activeColor)}
          className={getModeIconClassName(active, activeColor)}
        />
        <span className={getModeTitleClassName(active, activeColor)}>
          {title}
        </span>
      </div>
      <p className="min-w-0 text-wrap pr-2 font-semibold text-micro text-muted-foreground leading-snug">
        {description}
      </p>
    </Button>
  );
}
