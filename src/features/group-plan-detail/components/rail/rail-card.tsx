import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface RailCardProps {
  eyebrow?: string;
  heading?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "highlight" | "muted";
}

export function RailCard({
  eyebrow,
  heading,
  children,
  className,
  tone = "default",
}: RailCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-colors",
        tone === "default" && "border-border bg-card",
        tone === "highlight" && "border-forge-teal/25 bg-forge-teal/5",
        tone === "muted" && "border-border/70 bg-card/60",
        className,
      )}
    >
      {eyebrow ? (
        <p className="type-signature-label font-black text-forge-teal uppercase tracking-widest">
          {eyebrow}
        </p>
      ) : null}
      {heading ? (
        <h3 className="mt-1 font-black text-foreground text-sm">{heading}</h3>
      ) : null}
      <div className={cn(eyebrow || heading ? "mt-3" : "")}>{children}</div>
    </div>
  );
}
