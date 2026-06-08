import {
  Gauge,
  type LucideIcon,
  MapPin,
  Network,
  ShieldCheck,
  Tags,
  UsersRound,
} from "lucide-react";
import type { GroupPlanFitSignal } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { cn } from "@/shared/lib/utils";
import { StrengthDots } from "./strength-dots";

const SIGNAL_ICONS: Record<GroupPlanFitSignal["key"], LucideIcon> = {
  SHARED_INTERESTS: Tags,
  SOCIAL_PACE: UsersRound,
  LOCATION: MapPin,
  KNOWN_CONNECTION: Network,
  RELIABILITY: ShieldCheck,
  LIFE_STAGE: Gauge,
};

export function SignalRow({ signal }: { signal: GroupPlanFitSignal }) {
  const Icon = SIGNAL_ICONS[signal.key];

  return (
    <div className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/40">
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          signal.strength === "HIGH" && "text-forge-teal",
          signal.strength === "MEDIUM" && "text-spark-amber",
          signal.strength === "LOW" && "text-muted-foreground",
        )}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground text-sm leading-tight">
            {signal.label}
          </h3>
          <StrengthDots strength={signal.strength} />
        </div>
        <p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
          {signal.detail}
        </p>
      </div>
    </div>
  );
}
