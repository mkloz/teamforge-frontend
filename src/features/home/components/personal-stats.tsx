import { AnimatedCircularProgressBar } from "@/shared/components/ui/animated-circular-progress-bar";
import { NumberTicker } from "@/shared/components/ui/number-ticker";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  UserCheck,
  Users,
  TrendingUp,
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
}

function StatItem({
  icon: Icon,
  value,
  label,
  suffix = "",
  delay = 0,
}: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      role="listitem"
      className="flex flex-col gap-1"
    >
      <div className="flex items-end gap-1">
        <span className="text-2xl font-black tracking-tighter text-foreground tabular-nums leading-none">
          <NumberTicker value={value} delay={delay} />
        </span>
        {suffix && (
          <span className="text-sm font-bold text-muted-foreground mb-0.5">
            {suffix}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <Icon className="size-3 shrink-0" aria-hidden="true" />
        {label}
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
  return (
    <section aria-labelledby="personal-stats-heading" className="w-full">
      {/* Section header */}
      <div className="mb-4">
        <h2
          id="personal-stats-heading"
          className="text-base font-black tracking-tight text-foreground"
        >
          Your Progress
        </h2>
      </div>

      {/* Stats panel */}
      <div className="rounded-3xl border-2 border-border bg-card p-5 md:p-6">
        {/* Trust score + stats layout */}
        <div className="flex flex-col items-center gap-5">
          {/* Trust score ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col items-center gap-2"
            aria-label={`Trust score: ${stats.trustScore}`}
          >
            <div className="relative">
              <AnimatedCircularProgressBar
                max={100}
                min={0}
                value={stats.trustScore}
                gaugePrimaryColor="var(--color-spark-amber)"
                gaugeSecondaryColor="var(--color-muted)"
                className={cn(
                  "size-28 text-xl font-black tracking-tighter",
                  "[&>span]:text-foreground",
                )}
              />
              {/* Shield icon overlay on the ring center */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                <ShieldCheck
                  className="size-3.5 text-spark-amber"
                  aria-hidden="true"
                />
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Trust Score
            </span>
          </motion.div>

          {/* Divider */}
          <div className="w-full h-px bg-border/60" aria-hidden="true" />

          {/* Stats 2x2 grid */}
          <div
            role="list"
            aria-label="Activity statistics"
            className="grid grid-cols-2 gap-x-6 gap-y-4 w-full"
          >
            <StatItem
              icon={Users}
              value={stats.groupsJoined}
              label="Groups Joined"
              delay={0.1}
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
            />
          </div>
        </div>
      </div>
    </section>
  );
}
