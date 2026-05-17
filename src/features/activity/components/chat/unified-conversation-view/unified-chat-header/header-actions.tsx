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
  actionLabel: string;
  isSearching: boolean;
  isActionOpen: boolean;
  showAction?: boolean;
  onToggleSearch: (state: boolean) => void;
  onToggleAction: () => void;
}

export const HeaderActions = memo(
  ({
    actionLabel,
    isSearching,
    isActionOpen,
    showAction = true,
    onToggleSearch,
    onToggleAction,
  }: HeaderActionsProps) => (
    <div className="flex items-center gap-1 pr-0.5 md:gap-1.5 md:pr-1">
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
                aria-label="Close conversation search"
                aria-expanded={isSearching}
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
                className="shrink-0"
                aria-label="Search conversation"
                aria-expanded={isSearching}
              >
                <Search className="size-4" strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search conversation</TooltipContent>
          </Tooltip>
          {showAction ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="accentGhost"
                  size="icon-sm"
                  onClick={onToggleAction}
                  className="shrink-0"
                  aria-expanded={isActionOpen}
                  aria-label={`${
                    isActionOpen ? "Close" : "Open"
                  } ${actionLabel}`}
                >
                  <MoreVertical
                    strokeWidth={2.5}
                    className={cn(
                      "size-4 transition-colors duration-200",
                      isActionOpen && "text-forge-teal",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{actionLabel}</TooltipContent>
            </Tooltip>
          ) : null}
        </>
      )}
    </div>
  ),
);
