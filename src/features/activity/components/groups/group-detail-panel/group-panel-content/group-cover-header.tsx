import { motion } from "framer-motion";
import { Pencil, X } from "lucide-react";
import type {
  Group,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

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
          className="size-full"
        >
          <PlanCover
            value={group.plan?.coverImage}
            alt={`${group.name} cover`}
            imageClassName="transition-transform duration-700 group-hover:scale-105"
            loading="eager"
          />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-canvas/90 via-canvas/10 to-transparent" />

        {currentUserRole === "ADMIN" && (
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(
              "absolute z-30 rounded-full border-0 bg-black/20 p-0 text-white backdrop-blur-sm transition-all hover:bg-black/40",
              isMobile ? "top-4 right-14 size-9" : "top-3 right-4",
            )}
            aria-label="Edit group settings"
            onClick={onEditGroup}
          >
            <Pencil className={isMobile ? "size-5" : "size-4"} />
          </Button>
        )}

        {isMobile && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full border-0 bg-black/20 p-0 text-white backdrop-blur-sm hover:bg-black/40"
            aria-label="Close group panel"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
