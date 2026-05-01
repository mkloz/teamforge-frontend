import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { Shield, Sparkles, UserPlus, type LucideIcon } from "lucide-react";
import { AnimatedCircularProgressBar } from "@/shared/components/ui/animated-circular-progress-bar";
import type { User } from "@/shared/schemas";
import { normalizeTrustScore } from "@/features/profile/lib/profile-utils";

interface ProfileBadgesProps {
  user: User;
  archetype: string;
}

interface BadgeItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description: string;
  colorClass: string;
  bgClass: string;
  iconBgClass: string;
  renderIconWrapper?: (children: React.ReactNode) => React.ReactNode;
}

function BadgeItem({
  icon: Icon,
  label,
  value,
  description,
  colorClass,
  bgClass,
  iconBgClass,
  renderIconWrapper,
}: BadgeItemProps) {
  const iconContent = (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-110",
        iconBgClass,
        colorClass,
      )}
    >
      <Icon className="w-4 h-4" />
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help group transition-transform duration-300 hover:-translate-y-0.5">
          {renderIconWrapper ? renderIconWrapper(iconContent) : iconContent}
          <div className="flex flex-col justify-center items-start">
            <span className="text-nano font-bold uppercase tracking-widest text-slate-muted leading-tight mb-0.5">
              {label}
            </span>
            <span
              className={cn(
                "text-xs md:text-sm font-extrabold leading-none",
                bgClass,
              )}
            >
              {value}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-xs p-4 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border z-100"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon size={14} className={colorClass} />
            <p className="text-xs font-bold tracking-tight">{label} Detail</p>
          </div>
          <p className="text-micro text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function ProfileBadges({ user, archetype }: ProfileBadgesProps) {
  const trustScore = normalizeTrustScore(user.trustScore);
  const trustColorClass =
    trustScore >= 80
      ? "text-primary"
      : trustScore >= 50
        ? "text-spark-amber"
        : "text-destructive";

  const trustLabel =
    trustScore >= 80 ? "High" : trustScore >= 50 ? "Medium" : "Low";

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-4 md:gap-5 shrink-0 flex-wrap justify-center md:justify-start"
      >
        {/* Trust Score */}
        <motion.div variants={itemVariants}>
          <BadgeItem
            icon={Shield}
            label="Trust"
            value={trustLabel}
            colorClass={trustColorClass}
            bgClass={trustColorClass}
            iconBgClass="bg-transparent"
            description={`A composite metric of your verifiable contributions and social reliability. Integrity: ${trustScore}%`}
            renderIconWrapper={() => (
              <div className="relative w-8 h-8 md:w-9 md:h-9 flex shrink-0 items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                  <AnimatedCircularProgressBar
                    max={100}
                    min={0}
                    value={trustScore}
                    gaugePrimaryColor="currentColor"
                    gaugeSecondaryColor="rgba(107, 114, 128, 0.15)"
                    className={cn(
                      "w-full h-full text-[0px]", // hide internal text, use the absolute span
                      trustColorClass,
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "relative text-nano md:text-micro font-black leading-none",
                    trustColorClass,
                  )}
                >
                  {trustScore}
                </span>
              </div>
            )}
          />
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="w-px h-6 bg-slate-muted/20 rounded-full hidden sm:block"
        />

        {/* Cognitive Profile */}
        <motion.div variants={itemVariants}>
          <BadgeItem
            icon={UserPlus}
            label="Type"
            value={user.personalityType || "N/A"}
            colorClass="text-forge-teal"
            bgClass="text-ink"
            iconBgClass="bg-forge-teal/10"
            description={`Based on Jungian personality theory, your ${user.personalityType ?? "profile"} type defines how you process information.`}
          />
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="w-px h-6 bg-slate-muted/20 rounded-full hidden sm:block"
        />

        {/* Archetype */}
        <motion.div variants={itemVariants}>
          <BadgeItem
            icon={Sparkles}
            label="Role"
            value={archetype}
            colorClass="text-spark-amber"
            bgClass="text-ink"
            iconBgClass="bg-spark-amber/10"
            description={`The ${archetype} archetype identifies your core value proposition in collaborative environments.`}
          />
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
