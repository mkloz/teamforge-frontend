import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import type { ExploreGroup } from "@/shared/schemas";
import { ExploreGroupPlanCard } from "./explore-group-plan-card";

interface ExploreFeedContentProps {
  groups: ExploreGroup[];
}

export function ExploreFeedContent({ groups }: ExploreFeedContentProps) {
  const featuredGroup = groups[0] ?? null;
  const remainingGroups = groups.slice(1);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {featuredGroup ? (
        <section className="space-y-2.5">
          <FeedSectionLabel
            title="Best opening right now"
            detail={`${groups.length} ${groups.length === 1 ? "group" : "groups"} available`}
          />
          <ExploreGroupMotion index={0} groupId={featuredGroup.id}>
            <ExploreGroupPlanCard group={featuredGroup} />
          </ExploreGroupMotion>
        </section>
      ) : null}

      {remainingGroups.length > 0 ? (
        <section className="space-y-2.5">
          <FeedSectionLabel
            title="More openings"
            detail={`${remainingGroups.length} more available`}
          />
          <AnimatePresence mode="popLayout">
            {remainingGroups.map((group, index) => (
              <ExploreGroupMotion
                key={group.id}
                index={index + 1}
                groupId={group.id}
              >
                <ExploreGroupPlanCard group={group} />
              </ExploreGroupMotion>
            ))}
          </AnimatePresence>
        </section>
      ) : null}
    </div>
  );
}

function FeedSectionLabel({
  detail,
  title,
}: {
  detail: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-1 max-[380px]:flex-col max-[380px]:items-start max-[380px]:gap-1">
      <p className="font-semibold text-muted-foreground text-sm">{title}</p>
      <span className="shrink-0 font-bold text-muted-foreground/70 text-sm">
        {detail}
      </span>
    </div>
  );
}

function ExploreGroupMotion({
  children,
  groupId,
  index,
}: {
  children: ReactNode;
  groupId: string;
  index: number;
}) {
  return (
    <motion.div
      key={groupId}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.28,
        delay: Math.min(index, 6) * 0.025,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
      layout
    >
      {children}
    </motion.div>
  );
}
