import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Handshake, Sparkles, Target } from "lucide-react";
import { MOCK_RECOMMENDED_GROUPS } from "../data/mock-home";
import type { RecommendedGroup } from "../types/home.types";

/* ── CompatibilityMeter ────────────────────────────────────────────── */
function CompatibilityMeter({ value }: { value: number }) {
  const isHigh = value >= 88;
  return (
    <div
      className="flex flex-col gap-1"
      aria-label={`Compatibility: ${value}%`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Match
        </span>
        <span
          className={cn(
            "text-[11px] font-black tabular-nums",
            isHigh ? "text-spark-amber" : "text-forge-teal",
          )}
        >
          {value}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            isHigh ? "bg-spark-amber" : "bg-forge-teal",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/* ── RecommendationCard ────────────────────────────────────────────── */
function RecommendationCard({
  group,
  index,
}: {
  group: RecommendedGroup;
  index: number;
}) {
  const isHighMatch = group.compatibility >= 88;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.23, 1, 0.32, 1],
      }}
      role="listitem"
      className={cn(
        "group flex flex-col rounded-3xl border-2 border-border bg-card overflow-hidden",
        "flex-shrink-0 w-[240px] md:w-auto",
        "transition-all duration-150 cursor-pointer",
        "hover:-translate-y-1 hover:border-ink hover:shadow-button-outline",
        "dark:hover:border-white dark:hover:shadow-button-outline-dark",
      )}
    >
      {/* Cover image */}
      <div className="relative w-full aspect-video overflow-hidden">
        <img
          src={group.imageUrl}
          alt={group.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/60 pointer-events-none"
          aria-hidden="true"
        />
        {/* Match badge */}
        <div className="absolute top-3 right-3 z-10">
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold shadow backdrop-blur-md",
              isHighMatch
                ? "bg-spark-amber/90 text-white border border-spark-amber/20"
                : "bg-black/60 text-white border border-white/20",
            )}
            aria-hidden="true"
          >
            <Target
              className={cn("size-3", isHighMatch && "animate-pulse-glow")}
            />
            {group.compatibility}%
          </div>
        </div>
        {/* Activity type pill */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
            {group.activityType}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-3 p-4 bg-canvas flex-1">
        {/* Group name + access badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-black tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {group.name}
          </h3>
          {group.access === "By Request" && (
            <span className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md border border-border/80 text-muted-foreground text-[10px] font-bold uppercase tracking-wider bg-background/50">
              <Handshake className="size-2.5" aria-hidden="true" />
              Req
            </span>
          )}
        </div>

        {/* Compatibility meter */}
        <CompatibilityMeter value={group.compatibility} />

        {/* Member avatar stack */}
        <div className="flex items-center gap-2">
          <div
            className="flex -space-x-2"
            aria-label={`${group.memberCount} members`}
          >
            {group.memberAvatarSeeds.slice(0, 4).map((seed, i) => (
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
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {group.memberCount} members
          </span>
        </div>

        {/* CTA button */}
        <Button
          variant={group.access === "By Request" ? "outline" : "primary"}
          size="sm"
          className="w-full"
          aria-label={`${group.access === "By Request" ? "Request to join" : "Join"} ${group.name}`}
        >
          {group.access === "By Request" ? "Request to Join" : "Join Group"}
        </Button>

        {/* Personalization cue */}
        <p className="text-[10px] font-semibold text-muted-foreground text-center leading-snug">
          {group.personalizationCue}
        </p>
      </div>
    </motion.div>
  );
}

/* ── RecommendedGroups section ─────────────────────────────────────── */
export function RecommendedGroups() {
  const groups = MOCK_RECOMMENDED_GROUPS;

  return (
    <section aria-labelledby="recommended-groups-heading" className="w-full">
      {/* Section header */}
      <div className="flex flex-col gap-0.5 mb-4">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3 text-forge-teal" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Based on your profile
          </span>
        </div>
        <h2
          id="recommended-groups-heading"
          className="text-base font-black tracking-tight text-foreground"
        >
          Groups You Might Like
        </h2>
      </div>

      {/*
        Mobile: horizontal scroll carousel with snap.
        md+:    auto-fit CSS grid, wraps naturally.
      */}
      <div
        role="list"
        className={cn(
          "flex flex-row gap-3 overflow-x-auto pb-2",
          "snap-x snap-mandatory scroll-smooth",
          "md:grid md:overflow-x-visible md:pb-0 md:snap-none",
        )}
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
      >
        {groups.map((group, i) => (
          <div key={group.id} className="snap-start">
            <RecommendationCard group={group} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
