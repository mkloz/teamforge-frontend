import { motion } from "framer-motion";
import { MoreVertical, Search, X } from "lucide-react";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface HeaderActionsProps {
  isSearching: boolean;
  isActionOpen: boolean;
  onToggleSearch: (state: boolean) => void;
  onToggleAction: () => void;
}

export const HeaderActions = memo(
  ({
    isSearching,
    isActionOpen,
    onToggleSearch,
    onToggleAction,
  }: HeaderActionsProps) => (
    <div className="flex items-center gap-1.5 pr-1">
      {isSearching ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="accentGhost"
                size="icon-sm"
                onClick={() => onToggleSearch(false)}
                className="shrink-0"
                aria-label="Cancel search"
              >
                <X className="size-4" strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel search</TooltipContent>
          </Tooltip>
        </motion.div>
      ) : (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="accentGhost"
                size="icon-sm"
                onClick={() => onToggleSearch(true)}
                className="group/search shrink-0"
                aria-label="Search conversation"
              >
                <Search
                  className="size-4 transition-transform group-hover/search:scale-110"
                  strokeWidth={2.5}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search conversation</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="accentGhost"
                size="icon-sm"
                onClick={onToggleAction}
                className="group/more shrink-0"
                aria-label="More options"
              >
                <MoreVertical
                  strokeWidth={2.5}
                  className={cn(
                    "size-4 transition-transform duration-300 group-hover/more:rotate-90",
                    isActionOpen && "rotate-90 text-forge-teal",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>More options</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  ),
);
