import { motion } from "framer-motion";
import { Users } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";

interface GroupIdentitySectionProps {
  name: string;
  description: string | null;
  avatar?: string | null;
  memberCount: number;
  maxMembers: number;
  hideAvatar?: boolean;
}

export function GroupIdentitySection({
  name,
  description,
  avatar,
  memberCount,
  maxMembers,
  hideAvatar = false,
}: GroupIdentitySectionProps) {
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
              className="group pointer-events-auto"
            >
              <Avatar
                src={avatar}
                name={name}
                alt={`${name} avatar`}
                shape="rounded"
                className="h-20 w-20 rounded-xl bg-muted ring-2 ring-border/30 shadow-lg"
                imageClassName="transition-transform duration-500 group-hover:scale-105"
              />
            </motion.div>
          </div>
        )}

        {/* Name and metadata */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground tracking-tight truncate leading-tight">
            {name}
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
      {description && (
        <p className="text-[13px] text-foreground/70 mt-3 leading-relaxed font-normal">
          {description}
        </p>
      )}
    </section>
  );
}
