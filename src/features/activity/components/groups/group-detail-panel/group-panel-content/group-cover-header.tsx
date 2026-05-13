import { X } from "lucide-react";
import type { Group } from "@/features/activity/lib/activity-contract";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface GroupCoverHeaderProps {
  group: Group;
  isMobile: boolean;
  onClose: () => void;
}

export function GroupCoverHeader({
  group,
  isMobile,
  onClose,
}: GroupCoverHeaderProps) {
  return (
    <header className="relative">
      <div className={cn("relative w-full", isMobile ? "h-44" : "h-40")}>
        <div className="size-full bg-canvas">
          <PlanCover
            value={group.plan?.coverImage}
            alt={`${group.name} cover`}
            imageClassName="transition-opacity duration-500 ease-out"
            loading="eager"
            loadingClassName="bg-canvas/35"
            loadingComponent={null}
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-canvas via-canvas/20 to-ink/20" />

        {isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 rounded-full border-0 bg-ink/35 p-0 text-white backdrop-blur-sm hover:bg-ink/55"
                aria-label="Close group panel"
              >
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close group panel</TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  );
}
