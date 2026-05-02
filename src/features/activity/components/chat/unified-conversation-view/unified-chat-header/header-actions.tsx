import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { MoreVertical, Search, X } from "lucide-react";
import { memo } from "react";
import { motion } from "framer-motion";

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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onToggleSearch(false)}
            className="text-slate-muted hover:text-ink shrink-0"
            aria-label="Cancel search"
          >
            <X size={18} strokeWidth={2.5} />
          </Button>
        </motion.div>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onToggleSearch(true)}
            className="text-slate-muted hover:text-forge-teal hover:bg-forge-teal/10 group/search shrink-0"
            aria-label="Search conversation"
          >
            <Search
              size={18}
              strokeWidth={2.5}
              className="group-hover/search:scale-110 transition-transform"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleAction}
            className="text-slate-muted hover:text-foreground shrink-0 group/more"
            aria-label="More options"
          >
            <MoreVertical
              size={18}
              strokeWidth={2.5}
              className={cn(
                "group-hover/more:rotate-90 transition-transform duration-300",
                isActionOpen && "rotate-90 text-forge-teal",
              )}
            />
          </Button>
        </>
      )}
    </div>
  ),
);
