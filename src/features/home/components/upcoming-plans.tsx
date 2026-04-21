import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageCircle,
  Palette,
  TreePine,
  Tv,
} from "lucide-react";
import { MOCK_UPCOMING_PLANS } from "../data/mock-home";
import type {
  ActivityCategory,
  PlanStatus,
  UpcomingPlan,
} from "../types/home.types";

/* ── Category icons ────────────────────────────────────────────────── */
const CATEGORY_ICONS: Record<ActivityCategory, React.ElementType> = {
  Outdoors: TreePine,
  Tech: Tv,
  Arts: Palette,
  Food: Calendar,
  Sports: Calendar,
  Music: Calendar,
  Social: Calendar,
  Wellness: Calendar,
};

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  Outdoors: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Tech: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Arts: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Food: "bg-orange-500/10 text-orange-500",
  Sports: "bg-red-500/10 text-red-500",
  Music: "bg-pink-500/10 text-pink-500",
  Social: "bg-forge-teal/10 text-forge-teal",
  Wellness: "bg-teal-500/10 text-teal-500",
};

/* ── Status config ─────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  PlanStatus,
  { label: string; classes: string; icon: React.ElementType }
> = {
  confirmed: {
    label: "Confirmed",
    classes: "bg-forge-teal/10 text-forge-teal",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    classes: "bg-spark-amber/10 text-spark-amber",
    icon: Clock,
  },
  planning: {
    label: "Planning",
    classes: "bg-muted text-muted-foreground",
    icon: Calendar,
  },
};

/* ── PlanCard ──────────────────────────────────────────────────────── */
function PlanCard({ plan, index }: { plan: UpcomingPlan; index: number }) {
  const CategoryIcon = CATEGORY_ICONS[plan.category];
  const categoryColor = CATEGORY_COLORS[plan.category];
  const status = STATUS_CONFIG[plan.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.07,
        ease: [0.23, 1, 0.32, 1],
      }}
      role="listitem"
      className={cn(
        "group flex flex-row items-center gap-3 md:gap-4",
        "rounded-2xl border-2 border-border bg-card p-3 md:p-4",
        "transition-all duration-150 cursor-pointer",
        "hover:-translate-y-0.5 hover:border-ink hover:shadow-button-outline",
        "dark:hover:border-white dark:hover:shadow-button-outline-dark",
      )}
    >
      {/* Category icon block */}
      <div
        className={cn(
          "shrink-0 size-11 rounded-2xl flex items-center justify-center",
          categoryColor,
        )}
        aria-hidden="true"
      >
        <CategoryIcon className="size-5" />
      </div>

      {/* Plan info */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors duration-200">
          {plan.title}
        </p>
        <p className="text-xs text-muted-foreground font-medium truncate">
          {plan.groupName}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Date pill */}
          <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <CalendarDays className="size-3" aria-hidden="true" />
            {plan.date}
          </span>
          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
              status.classes,
            )}
          >
            <StatusIcon className="size-3" aria-hidden="true" />
            {status.label}
          </span>
        </div>
      </div>

      {/* Right: avatar stack + action button */}
      <div className="shrink-0 flex flex-col items-end gap-2">
        {/* Member avatar stack */}
        <div
          className="flex -space-x-2"
          aria-label={`${plan.memberAvatarSeeds.length} members`}
        >
          {plan.memberAvatarSeeds.slice(0, 3).map((seed, i) => (
            <div
              key={i}
              className="size-6 rounded-full border-2 border-card bg-muted overflow-hidden"
            >
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`}
                alt={`Member ${i + 1}`}
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
          {plan.memberAvatarSeeds.length > 3 && (
            <div className="size-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-extrabold text-muted-foreground">
              +{plan.memberAvatarSeeds.length - 3}
            </div>
          )}
        </div>

        {/* Chat button */}
        <button
          type="button"
          aria-label={`Open chat for ${plan.title}`}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-xl",
            "text-[11px] font-bold text-muted-foreground",
            "border border-border bg-background",
            "hover:border-forge-teal/50 hover:text-forge-teal hover:bg-secondary",
            "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <MessageCircle className="size-3" aria-hidden="true" />
          Chat
        </button>
      </div>
    </motion.div>
  );
}

/* ── Empty state ───────────────────────────────────────────────────── */
function EmptyPlans() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
      <div
        className="size-12 rounded-2xl bg-muted flex items-center justify-center"
        aria-hidden="true"
      >
        <CalendarDays className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-foreground">
          Your calendar is clear
        </p>
        <p className="text-xs text-muted-foreground max-w-[220px]">
          Forge a group or join one to get activities on your calendar.
        </p>
      </div>
    </div>
  );
}

/* ── UpcomingPlans section ─────────────────────────────────────────── */
export function UpcomingPlans() {
  const plans = MOCK_UPCOMING_PLANS;

  return (
    <section aria-labelledby="upcoming-plans-heading" className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          id="upcoming-plans-heading"
          className="text-base font-black tracking-tight text-foreground"
        >
          Coming Up
        </h2>
        <a
          href="/plans"
          className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          View all
        </a>
      </div>

      {/* Cards list */}
      {plans.length === 0 ? (
        <EmptyPlans />
      ) : (
        <div role="list" className="flex flex-col gap-3">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
