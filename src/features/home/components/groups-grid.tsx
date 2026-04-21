import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Users } from "lucide-react";
import { MOCK_USER_GROUPS } from "../data/mock-home";
import type { UserGroup } from "../types/home.types";

/* ── GroupRow — horizontal list item layout ────────────────────────── */
function GroupRow({ group, index }: { group: UserGroup; index: number }) {
  return (
    <motion.a
      href={`/groups/${group.id}`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1],
      }}
      role="listitem"
      aria-label={`${group.name}${group.hasUnread ? ", has unread messages" : ""}. Last active ${group.lastActivity}.`}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border px-3 py-2.5",
        "transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "hover:border-forge-teal/30 hover:bg-secondary",
        group.hasUnread
          ? "border-forge-teal/20 bg-secondary/50"
          : "border-border bg-transparent",
      )}
    >
      {/* Avatar with unread ring */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "size-9 rounded-xl overflow-hidden border-2 transition-colors duration-150",
            group.hasUnread
              ? "border-forge-teal/50"
              : "border-border group-hover:border-forge-teal/30",
          )}
        >
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${group.avatarSeed}`}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
        {/* Unread dot */}
        {group.hasUnread && (
          <span
            className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-spark-amber border-2 border-card"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Name + metadata */}
      <div className="flex flex-col gap-0 flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-bold leading-tight truncate transition-colors duration-150",
            group.hasUnread
              ? "text-foreground"
              : "text-foreground group-hover:text-primary",
          )}
        >
          {group.name}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
            <Users className="size-2.5 shrink-0" aria-hidden="true" />
            {group.memberCount}
          </span>
          <span
            className="size-0.5 rounded-full bg-border"
            aria-hidden="true"
          />
          <span className="text-[11px] text-muted-foreground font-medium truncate">
            {group.lastActivity}
          </span>
        </div>
      </div>

      {/* Trailing icon */}
      <div className="shrink-0" aria-hidden="true">
        {group.hasUnread ? (
          <MessageCircle className="size-4 text-forge-teal" />
        ) : (
          <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        )}
      </div>
    </motion.a>
  );
}

/* ── GroupsGrid section ────────────────────────────────────────────── */
export function GroupsGrid() {
  const groups = MOCK_USER_GROUPS;
  const unreadCount = groups.filter((g) => g.hasUnread).length;

  return (
    <section aria-labelledby="groups-grid-heading" className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2
            id="groups-grid-heading"
            className="text-base font-black tracking-tight text-foreground"
          >
            Your Groups
          </h2>
          {/* Unread badge */}
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-spark-amber text-[10px] font-black text-white"
              aria-label={`${unreadCount} groups with unread messages`}
            >
              {unreadCount}
            </motion.span>
          )}
        </div>

        <a
          href="/groups"
          className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          View all
        </a>
      </div>

      {/* Group list */}
      <div
        role="list"
        aria-label="Your groups"
        className="flex flex-col gap-1.5"
      >
        {groups.map((group, i) => (
          <GroupRow key={group.id} group={group} index={i} />
        ))}
      </div>

      {/* Browse more CTA */}
      <motion.a
        href="/explore"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: groups.length * 0.05 + 0.1 }}
        className={cn(
          "mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl",
          "border border-dashed border-border",
          "text-[11px] font-bold text-muted-foreground",
          "hover:border-forge-teal/40 hover:text-forge-teal hover:bg-secondary",
          "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-label="Browse and discover new groups"
      >
        <ArrowRight className="size-3.5" aria-hidden="true" />
        Browse more groups
      </motion.a>
    </section>
  );
}
