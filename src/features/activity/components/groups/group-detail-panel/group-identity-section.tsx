import { Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { GroupIdentity } from "@/features/activity/types/groups.types";

interface GroupIdentitySectionProps {
  identity: GroupIdentity;
  memberCount: number;
  maxMembers: number;
  hideAvatar?: boolean;
}

export function GroupIdentitySection({
  identity,
  memberCount,
  maxMembers,
  hideAvatar = false,
}: GroupIdentitySectionProps) {
  return (
    <section className="relative">
      {/* Group identity - focusing on name and metadata */}
      <div className="flex items-start gap-4">
        {!hideAvatar && (
          /* Avatar with edit overlay for admins (Fallback if hideAvatar is false) */
          <div
            className={cn(
              "relative w-20 h-20 rounded-2xl overflow-hidden bg-muted ring-2 ring-border shadow-md",
            )}
          >
            <img
              src={identity.avatar}
              alt={identity.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Name and metadata */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground tracking-tight truncate leading-tight">
            {identity.name}
          </h2>

          {/* Member count & Metadata */}
          <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-1">
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
            </div>

            <span className="text-muted-foreground/20 hidden sm:inline">•</span>

            <p className="text-[11px] text-muted-foreground/60 font-medium">
              Created Mar 4, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {identity.description && (
        <p className="text-[13px] text-foreground/70 mt-3 leading-relaxed font-normal">
          {identity.description}
        </p>
      )}

      {/* Visual separator between identity and plan - Premium Style */}
      <div className="flex items-center gap-3 mt-6 mb-2">
        <div className="h-px flex-1 bg-linear-to-r from-border/10 via-border to-border/10" />
        <div className="px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          Current Plan
        </div>
        <div className="h-px flex-1 bg-linear-to-r from-border/10 via-border to-border/10" />
      </div>
    </section>
  );
}
