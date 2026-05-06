import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

import type { ProfileBadgeModel } from "./profile-badge.types";

interface ProfileBadgeItemProps {
  badge: ProfileBadgeModel;
}

export function ProfileBadgeItem({ badge }: ProfileBadgeItemProps) {
  const Icon = badge.icon;
  const iconContent = (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-110",
        badge.iconBgClass,
        badge.colorClass,
      )}
    >
      <Icon className="w-4 h-4" />
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help group transition-transform duration-300 hover:-translate-y-0.5">
          {badge.renderIconWrapper
            ? badge.renderIconWrapper(iconContent)
            : iconContent}
          <div className="flex flex-col justify-center items-start">
            <span className="text-nano font-bold uppercase tracking-widest text-slate-muted leading-tight mb-0.5">
              {badge.label}
            </span>
            <span
              className={cn(
                "text-xs md:text-sm font-extrabold leading-none",
                badge.bgClass,
              )}
            >
              {badge.value}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-xs p-4 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border z-100"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon size={14} className={badge.colorClass} />
            <p className="text-xs font-bold tracking-tight">
              {badge.label} Detail
            </p>
          </div>
          <p className="text-micro text-muted-foreground leading-relaxed">
            {badge.description}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
