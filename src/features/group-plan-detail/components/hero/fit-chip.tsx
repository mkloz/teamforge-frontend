import { Sparkles } from "lucide-react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getFitPercent } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { cn } from "@/shared/lib/utils";

interface FitChipProps {
  detail: GroupPlanDetail;
  tone?: "overlay" | "surface";
}

export function FitChip({ detail, tone = "overlay" }: FitChipProps) {
  const percent = getFitPercent(detail.fit?.totalScore);
  const verdict = getVerdict(percent);
  const strongCount =
    detail.fit?.signals.filter((signal) => signal.strength === "HIGH").length ??
    0;
  const totalCount = detail.fit?.signals.length ?? 0;
  const suffix =
    totalCount > 0 ? ` · ${strongCount} of ${totalCount} signals strong` : "";

  const isOverlay = tone === "overlay";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-bold text-xs tracking-wide",
        isOverlay
          ? "border-canvas/30 bg-ink/55 text-canvas backdrop-blur-md"
          : "border-forge-teal/25 bg-forge-teal/10 text-forge-teal",
      )}
    >
      <Sparkles className="size-3.5" aria-hidden="true" />
      <span className="uppercase">
        {verdict}
        {suffix}
      </span>
    </span>
  );
}

function getVerdict(percent: number | null) {
  if (percent === null) return "Fit still settling";
  if (percent >= 75) return "Strong fit for you";
  if (percent >= 60) return "Worth a look";
  if (percent >= 45) return "Some overlap";
  return "Loose fit";
}
