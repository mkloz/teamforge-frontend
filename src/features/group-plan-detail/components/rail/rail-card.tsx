import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface RailCardProps {
  eyebrow?: string;
  heading?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "highlight" | "muted";
}

type RailCardTone = NonNullable<RailCardProps["tone"]>;

const RAIL_CARD_TONE_CLASS = {
  default: "border-border bg-card",
  highlight: "border-forge-teal/25 bg-forge-teal/5",
  muted: "border-border/70 bg-card/60",
} satisfies Record<RailCardTone, string>;

export function RailCard({
  eyebrow,
  heading,
  children,
  className,
  tone = "default",
}: RailCardProps) {
  const hasHeader = hasRailCardHeader({ eyebrow, heading });

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-colors",
        RAIL_CARD_TONE_CLASS[tone],
        className,
      )}
    >
      <RailCardEyebrow eyebrow={eyebrow} />
      <RailCardHeading heading={heading} />
      <div className={cn(getRailCardContentClass(hasHeader))}>{children}</div>
    </div>
  );
}

function RailCardEyebrow({ eyebrow }: { eyebrow?: string }) {
  if (!eyebrow) {
    return null;
  }

  return <p className="font-bold text-muted-foreground text-xs">{eyebrow}</p>;
}

function RailCardHeading({ heading }: { heading?: string }) {
  if (!heading) {
    return null;
  }

  return <h3 className="mt-1 font-bold text-foreground text-sm">{heading}</h3>;
}

function hasRailCardHeader({
  eyebrow,
  heading,
}: Pick<RailCardProps, "eyebrow" | "heading">) {
  return Boolean(eyebrow || heading);
}

function getRailCardContentClass(hasHeader: boolean) {
  return hasHeader ? "mt-3" : "";
}
