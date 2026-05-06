import type {
  Group,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Pencil, X } from "lucide-react";

interface GroupCoverHeaderProps {
  currentUserRole: MemberRole;
  group: Group;
  isMobile: boolean;
  onClose: () => void;
  onEditGroup: () => void;
}

export function GroupCoverHeader({
  currentUserRole,
  group,
  isMobile,
  onClose,
  onEditGroup,
}: GroupCoverHeaderProps) {
  return (
    <header className="relative">
      <div className={cn("relative w-full", isMobile ? "h-44" : "h-36")}>
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          className="h-full w-full"
        >
          <PlanCover
            value={group.plan?.coverImage}
            alt={`${group.name} cover`}
            imageClassName="transition-[scale,transform] duration-700 group-hover:scale-105"
            loading="eager"
          />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-canvas/90 via-canvas/10 to-transparent" />

        {currentUserRole === "ADMIN" && (
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(
              "absolute z-30 transition-all p-0",
              isMobile ? "top-4 right-14 size-9" : "top-3 right-4",
              "bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full",
            )}
            aria-label="Edit group settings"
            onClick={onEditGroup}
          >
            <Pencil size={isMobile ? 18 : 16} />
          </Button>
        )}

        {isMobile && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="absolute top-3 right-3 p-0 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full"
            aria-label="Close group panel"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </header>
  );
}
