import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { GroupStatus } from "@/features/activity/types/groups.types";
import { groupStatusColors, groupStatusLabels } from "./lib/constants";
import { useMemo } from "react";

interface GroupIdentitySectionProps {
  name: string;
  description: string | null;
  avatar?: string | null;
  memberCount: number;
  maxMembers: number;
  createdAt?: string;
  status?: GroupStatus;
  hideAvatar?: boolean;
}

// Format creation date
const formatCreatedDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function GroupIdentitySection({
  name,
  description,
  avatar,
  memberCount,
  maxMembers,
  createdAt,
  status,
  hideAvatar = false,
}: GroupIdentitySectionProps) {
  // Memoize formatted date for performance
  const formattedCreatedDate = useMemo(() => {
    if (!createdAt) return null;
    return formatCreatedDate(createdAt);
  }, [createdAt]);

  // Calculate member fill percentage
  const memberFillPercent = useMemo(() => {
    if (maxMembers <= 0) return 0;
    return Math.min((memberCount / maxMembers) * 100, 100);
  }, [memberCount, maxMembers]);

  const slotsRemaining = maxMembers - memberCount;

  return (
    <section className="relative">
      {/* Group identity - focusing on name and metadata */}
      <div className="flex items-start gap-4">
        {!hideAvatar && (
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-xl overflow-hidden bg-muted ring-2 ring-border/30 shadow-lg flex items-center justify-center group pointer-events-auto"
            >
              <img
                src={avatar || undefined}
                alt={`${name} avatar`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>
        )}

        {/* Name and metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-foreground tracking-tight truncate leading-tight">
              {name}
            </h2>
            {/* Group Status Badge */}
            {status && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase shrink-0",
                  groupStatusColors[status],
                )}
              >
                {groupStatusLabels[status]}
              </span>
            )}
          </div>

          {/* Member count with progress indicator */}
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-1 text-[13px] font-medium text-muted-foreground">
              <Users size={12} className="text-teal-600/70" />
              <span>
                {memberCount}{" "}
                <span className="text-muted-foreground/40 font-normal">/</span>{" "}
                {maxMembers}{" "}
                <span className="text-muted-foreground/40 font-normal">
                  members
                </span>
              </span>
              {slotsRemaining > 0 && slotsRemaining <= 3 && (
                <span className="text-[10px] text-amber-600 font-semibold ml-1">
                  ({slotsRemaining} {slotsRemaining === 1 ? "slot" : "slots"}{" "}
                  left)
                </span>
              )}
            </div>

            {/* Progress bar for member capacity */}
            <div className="w-full h-1 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${memberFillPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  memberFillPercent >= 90
                    ? "bg-amber-500"
                    : memberFillPercent >= 70
                      ? "bg-forge-teal"
                      : "bg-forge-teal/70",
                )}
              />
            </div>
          </div>

          {/* Creation date */}
          {formattedCreatedDate && (
            <p className="text-[11px] text-muted-foreground/60 font-medium mt-1.5">
              Created {formattedCreatedDate}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-[13px] text-foreground/70 mt-3 leading-relaxed font-normal">
          {description}
        </p>
      )}
    </section>
  );
}
