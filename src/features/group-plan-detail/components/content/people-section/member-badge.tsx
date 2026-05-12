import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function MemberBadge({
  color,
  icon: Icon,
  text,
}: {
  color: "teal" | "amber" | "muted";
  icon: LucideIcon;
  text: string;
}) {
  return (
    <span
      className={cn(
        "type-signature-label inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-bold",
        color === "teal" &&
          "border-forge-teal/20 bg-forge-teal/8 text-forge-teal",
        color === "amber" &&
          "border-spark-amber/25 bg-spark-amber/8 text-spark-amber",
        color === "muted" &&
          "border-border/60 bg-muted/60 text-muted-foreground",
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      <span className="truncate">{text}</span>
    </span>
  );
}
