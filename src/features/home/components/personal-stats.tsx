import { AnimatedCircularProgressBar } from "@/shared/components/ui/animated-circular-progress-bar";
import { NumberTicker } from "@/shared/components/ui/number-ticker";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { MOCK_USER_STATS } from "../data/mock-home";
import type { UserStats } from "../types/home.types";

/* ── StatItem ──────────────────────────────────────────────────────── */
interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
  accent?: boolean;
}

function StatItem({
  icon: Icon,
  value,
  label,
  suffix = "",
  delay = 0,
  accent = false,
}: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      role="listitem"
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 transition-colors duration-150",
        accent
          ? "border-forge-teal/20 bg-secondary"
          : "border-border bg-muted/40",
      )}
    >
      {/* Icon badge */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center size-8 rounded-xl",
          accent ? "bg-forge-teal/15" : "bg-muted",
        )}
        aria-hidden="true"
      >
        <Icon
          className={cn(
            "size-4",
            accent ? "text-forge-teal" : "text-muted-foreground",
          )}
        />
      </div>

      {/* Value + label */}
      <div className="flex flex-col gap-0 min-w-0">
        <div className="flex items-baseline gap-0.5 leading-none">
          <span className="text-lg font-black tracking-tighter text-foreground tabular-nums">
            <NumberTicker value={value} delay={delay} />
          </span>
          {suffix && (
            <span className="text-xs font-bold text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground leading-tight mt-0.5">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

/* ── PersonalStats section ─────────────────────────────────────────── */
export function PersonalStats({
  stats = MOCK_USER_STATS,
}: {
  stats?: UserStats;
}) {
  const trustPercent = Math.min(100, Math.max(0, stats.trustScore));

  // Determine trust tier label and color class
  const trustTier =
    trustPercent >= 90
      ? { label: "Excellent", className: "text-forge-teal" }
      : trustPercent >= 70
        ? { label: "Good", className: "text-spark-amber" }
        : { label: "Building", className: "text-muted-foreground" };

  return (
    <section aria-labelledby="personal-stats-heading" className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          id="personal-stats-heading"
          className="text-base font-black tracking-tight text-foreground"
        >
          Your Progress
        </h2>
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-widest",
            trustTier.className,
          )}
        >
          {trustTier.label}
        </span>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {/* Trust score band — dark inset at the top */}
        <div className="relative flex items-center gap-5 bg-ink px-5 py-5">
          {/* Subtle teal glow behind ring */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 20% 50%, #0d9488 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          {/* Progress ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="relative shrink-0"
            aria-label={`Trust score: ${stats.trustScore} out of 100`}
          >
            <AnimatedCircularProgressBar
              max={100}
              min={0}
              value={trustPercent}
              gaugePrimaryColor="var(--color-spark-amber)"
              gaugeSecondaryColor="rgba(255,255,255,0.08)"
              className={cn(
                "size-24 text-lg font-black tracking-tighter",
                "[&>span]:text-white",
              )}
            />
            {/* Shield badge at bottom of ring */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center size-5 rounded-full bg-spark-amber shadow-amber-glow">
              <ShieldCheck className="size-3 text-white" aria-hidden="true" />
            </div>
          </motion.div>

          {/* Right of ring: label + progress bar */}
          <div className="flex flex-col gap-2 flex-1 min-w-0 relative z-10">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Trust Score
              </span>
              <span className="text-2xl font-black tracking-tighter text-white leading-none tabular-nums">
                {stats.trustScore}
                <span className="text-sm font-bold text-white/40">/100</span>
              </span>
            </div>

            {/* Linear progress bar */}
            <div
              className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"
              role="progressbar"
              aria-valuenow={trustPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Trust score progress: ${trustPercent}%`}
            >
              <motion.div
                className="h-full rounded-full bg-spark-amber"
                initial={{ width: 0 }}
                animate={{ width: `${trustPercent}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </div>

            {/* Tier badge */}
            <span
              className={cn(
                "text-[11px] font-bold",
                trustTier.className === "text-forge-teal"
                  ? "text-forge-teal-light"
                  : "text-spark-amber",
              )}
            >
              {trustTier.label} standing
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="p-4">
          <div
            role="list"
            aria-label="Activity statistics"
            className="grid grid-cols-2 gap-2"
          >
            <StatItem
              icon={Users}
              value={stats.groupsJoined}
              label="Groups Joined"
              delay={0.1}
              accent
            />
            <StatItem
              icon={Activity}
              value={stats.activitiesDone}
              label="Activities Done"
              delay={0.15}
            />
            <StatItem
              icon={UserCheck}
              value={stats.connections}
              label="Connections"
              delay={0.2}
            />
            <StatItem
              icon={TrendingUp}
              value={stats.profileCompleteness}
              label="Profile"
              suffix="%"
              delay={0.25}
              accent
            />
          </div>
        </div>
      </div>
    </section>
  );
}
