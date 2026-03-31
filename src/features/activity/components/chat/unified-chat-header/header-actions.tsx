import { Button } from "@/shared/components/ui/button";
import { MoreVertical, Phone, Search, X } from "lucide-react";
import { memo } from "react";

interface HeaderActionsProps {
  isSearching: boolean;
  onToggleSearch: (state: boolean) => void;
  isGroup: boolean;
  onToggleAction: () => void;
}

export const HeaderActions = memo(
  ({
    isSearching,
    onToggleSearch,
    isGroup,
    onToggleAction,
  }: HeaderActionsProps) => (
    <div className="flex items-center gap-1 pr-1">
      {isSearching ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleSearch(false)}
          className="h-9 w-9 text-slate-muted hover:text-foreground hover:bg-muted rounded-full transition-colors"
        >
          <X size={18} strokeWidth={2} />
        </Button>
      ) : (
        <>
          {!isGroup && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex h-9 w-9 text-slate-muted hover:text-forge-teal hover:bg-forge-teal/10 rounded-full transition-colors"
            >
              <Phone size={18} strokeWidth={2} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleSearch(true)}
            className="h-9 w-9 text-slate-muted hover:text-forge-teal hover:bg-forge-teal/10 rounded-full transition-colors"
          >
            <Search size={18} strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAction}
            className="h-9 w-9 text-slate-muted hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <MoreVertical size={18} strokeWidth={2} />
          </Button>
        </>
      )}
    </div>
  ),
);
