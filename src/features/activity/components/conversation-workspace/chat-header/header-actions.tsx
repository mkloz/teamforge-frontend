import { domAnimation, LazyMotion, m } from "framer-motion";
import { MoreVertical, Search, X } from "lucide-react";
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

const headerButtonIconStrokeWidth = 2.5;

export function HeaderActions({
  actionLabel,
  isSearching,
  isActionOpen,
  showAction = true,
  onToggleSearch,
  onToggleAction,
}: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-1 pr-0.5 md:gap-1.5 md:pr-1">
      {isSearching ? (
        <CloseSearchButton
          isSearching={isSearching}
          onToggleSearch={onToggleSearch}
        />
      ) : (
        <>
          <OpenSearchButton
            isSearching={isSearching}
            onToggleSearch={onToggleSearch}
          />
          {showAction ? (
            <ConversationActionButton
              actionLabel={actionLabel}
              isActionOpen={isActionOpen}
              onToggleAction={onToggleAction}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

function CloseSearchButton({
  isSearching,
  onToggleSearch,
}: {
  isSearching: boolean;
  onToggleSearch: (state: boolean) => void;
}) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
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
              <X className="size-4" strokeWidth={headerButtonIconStrokeWidth} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancel search</TooltipContent>
        </Tooltip>
      </m.div>
    </LazyMotion>
  );
}

function OpenSearchButton({
  isSearching,
  onToggleSearch,
}: {
  isSearching: boolean;
  onToggleSearch: (state: boolean) => void;
}) {
  return (
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
          <Search
            className="size-4"
            strokeWidth={headerButtonIconStrokeWidth}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Search conversation</TooltipContent>
    </Tooltip>
  );
}

function ConversationActionButton({
  actionLabel,
  isActionOpen,
  onToggleAction,
}: {
  actionLabel: string;
  isActionOpen: boolean;
  onToggleAction: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="accentGhost"
          size="icon-sm"
          onClick={onToggleAction}
          className="shrink-0"
          aria-expanded={isActionOpen}
          aria-label={getConversationActionLabel(actionLabel, isActionOpen)}
        >
          <MoreVertical
            strokeWidth={headerButtonIconStrokeWidth}
            className={cn(
              "size-4 transition-colors duration-200",
              isActionOpen && "text-foreground",
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{actionLabel}</TooltipContent>
    </Tooltip>
  );
}

function getConversationActionLabel(
  actionLabel: string,
  isActionOpen: boolean,
) {
  return `${isActionOpen ? "Close" : "Open"} ${actionLabel}`;
}
