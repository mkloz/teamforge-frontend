import { motion } from "framer-motion";
import { Users } from "lucide-react";

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
          <div className="px-4 relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-xl overflow-hidden bg-muted ring-4 ring-canvas shadow-xl flex items-center justify-center group pointer-events-auto"
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
