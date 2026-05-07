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
                className="h-20 w-20 rounded-xl bg-muted shadow-lg ring-2 ring-border/30"
                imageClassName="transition-[scale,transform] duration-500 group-hover:scale-105"
              />
            </motion.div>
          </div>
        )}

        {/* Name and metadata */}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl leading-tight font-bold tracking-tight text-foreground">
            {name}
          </h2>

          {/* Member count & Metadata */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Users className="size-3.5 text-forge-teal/70" />
              <span>
                {memberCount}{" "}
                <span className="font-normal text-muted-foreground/40">/</span>{" "}
                {maxMembers}{" "}
                <span className="font-normal text-muted-foreground/40">
                  members
                </span>
              </span>
            </div>

            <span className="hidden text-muted-foreground/20 sm:inline">•</span>

            <p className="text-xs font-medium text-muted-foreground/60">
              Created Mar 4, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="mt-3 text-sm leading-relaxed font-normal text-foreground/70">
          {description}
        </p>
      )}
    </section>
  );
}
