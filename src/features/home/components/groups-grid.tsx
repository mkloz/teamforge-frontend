import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { MOCK_USER_GROUPS } from "../data/mock-home";
import type { UserGroup } from "../types/home.types";

/* ── GroupTile ─────────────────────────────────────────────────────── */
function GroupTile({ group, index }: { group: UserGroup; index: number }) {
  return (
    <motion.a
      href={`/groups/${group.id}`}
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1],
      }}
      role="listitem"
      aria-label={`${group.name}${group.hasUnread ? ", has unread messages" : ""}`}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-3",
        "transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "hover:-translate-y-0.5 hover:border-ink hover:shadow-button-outline",
        "dark:hover:border-white dark:hover:shadow-button-outline-dark",
        group.hasUnread && "border-forge-teal/30",
      )}
    >
      {/* Unread indicator dot */}
      {group.hasUnread && (
        <span
          className="absolute -top-1 -right-1 size-3 rounded-full bg-spark-amber border-2 border-background animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Group avatar */}
      <div className="relative size-11 rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
        <img
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${group.avatarSeed}`}
          alt={group.name}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Group name */}
      <p className="text-[11px] font-bold text-foreground text-center leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-150 w-full px-0.5">
        {group.name}
      </p>

      {/* Member count */}
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground">
        <Users className="size-2.5" aria-hidden="true" />
        {group.memberCount}
      </span>
    </motion.a>
  );
}

/* ── ViewAllTile ───────────────────────────────────────────────────── */
function ViewAllTile({ totalCount }: { totalCount: number }) {
  return (
    <motion.a
      href="/groups"
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: totalCount * 0.05,
        ease: [0.23, 1, 0.32, 1],
      }}
      role="listitem"
      aria-label="View all groups"
      className={cn(
        "group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent p-3",
        "transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "hover:border-forge-teal/50 hover:bg-secondary",
      )}
    >
      <div
        className="size-9 rounded-full bg-muted flex items-center justify-center group-hover:bg-forge-teal/10 transition-colors duration-150"
        aria-hidden="true"
      >
        <ArrowRight className="size-4 text-muted-foreground group-hover:text-forge-teal transition-colors duration-150" />
      </div>
      <span className="text-[11px] font-bold text-muted-foreground group-hover:text-forge-teal transition-colors duration-150 text-center">
        All Groups
      </span>
    </motion.a>
  );
}

/* ── GroupsGrid section ────────────────────────────────────────────── */
export function GroupsGrid() {
  const groups = MOCK_USER_GROUPS;

  return (
    <section aria-labelledby="groups-grid-heading" className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          id="groups-grid-heading"
          className="text-base font-black tracking-tight text-foreground"
        >
          Your Groups
        </h2>
        <span
          className="inline-flex items-center justify-center size-5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground"
          aria-label={`${groups.length} groups`}
        >
          {groups.length}
        </span>
      </div>

      {/* Grid */}
      <div
        role="list"
        className="grid gap-2.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}
      >
        {groups.map((group, i) => (
          <GroupTile key={group.id} group={group} index={i} />
        ))}
        <ViewAllTile totalCount={groups.length} />
      </div>
    </section>
  );
}
