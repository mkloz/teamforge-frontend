import { type LucideIcon, ShieldCheck, Target } from "lucide-react";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import type { MemberCardViewState } from "../member-card-view-state";
import type { MemberMetricItem } from "./types";

export function MemberMetrics({
  viewState,
}: {
  viewState: MemberCardViewState;
}) {
  const metricItems = getMemberMetricItems(viewState);

  if (!viewState.hasMetrics || metricItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
      {metricItems.map((item, index) => (
        <MetricWithSeparator
          key={item.key}
          item={item}
          showSeparator={index > 0}
        />
      ))}
    </div>
  );
}

function getMemberMetricItems(
  viewState: MemberCardViewState,
): MemberMetricItem[] {
  return [
    getMemberMetricItem({
      icon: ShieldCheck,
      isHighlighted: viewState.isHighTrust,
      key: "trust",
      label: "Trust",
      score: viewState.trustPercent,
    }),
    getMemberMetricItem({
      icon: Target,
      isHighlighted: viewState.isHighCompatibility,
      key: "fit",
      label: "Fit",
      score: viewState.fitScore,
    }),
  ].filter((item): item is MemberMetricItem => item !== null);
}

function getMemberMetricItem({
  icon,
  isHighlighted,
  key,
  label,
  score,
}: {
  icon: LucideIcon;
  isHighlighted: boolean;
  key: MemberMetricItem["key"];
  label: string;
  score: number | null;
}): MemberMetricItem | null {
  if (typeof score !== "number") {
    return null;
  }

  return {
    icon,
    key,
    label,
    tone: isHighlighted ? "teal" : "muted",
    value: `${score}%`,
  };
}

function MetricWithSeparator({
  item,
  showSeparator,
}: {
  item: MemberMetricItem;
  showSeparator: boolean;
}) {
  return (
    <>
      {showSeparator ? <MetricSeparator /> : null}
      <MemberMetric
        icon={item.icon}
        label={item.label}
        tone={item.tone}
        value={item.value}
      />
    </>
  );
}

interface MemberMetricProps {
  icon: LucideIcon;
  label: string;
  tone: "muted" | "teal";
  value: string;
}

function MemberMetric({ icon: Icon, label, tone, value }: MemberMetricProps) {
  return (
    <StatusPill
      icon={Icon}
      iconClassName="size-3.5"
      tone={tone === "teal" ? "teal" : "neutral"}
      surface="ghost"
      className={cn(
        "gap-1 p-0 text-xs leading-tight",
        tone !== "teal" && "text-muted-foreground",
      )}
      title={`${label} ${value}`}
    >
      <span className="sr-only">{label}</span>
      <span>{value}</span>
    </StatusPill>
  );
}

function MetricSeparator() {
  return (
    <span
      className="size-1 shrink-0 rounded-full bg-muted-foreground/35"
      aria-hidden="true"
    />
  );
}
