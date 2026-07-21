import { ChevronDown, ChevronUp, Search } from "lucide-react";
import type { Ref } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface HeaderSearchProps {
  query: string;
  resultLabel?: string;
  isNavigationDisabled?: boolean;
  setQuery: (query: string) => void;
  onNextResult?: () => void;
  onPreviousResult?: () => void;
  ref?: Ref<HTMLInputElement>;
}

export function HeaderSearch({
  query,
  resultLabel,
  isNavigationDisabled = true,
  setQuery,
  onNextResult,
  onPreviousResult,
  ref,
}: HeaderSearchProps) {
  return (
    <div className="fade-in slide-in-from-left-2 flex min-w-0 flex-1 animate-in items-center gap-2 duration-300">
      <div className="relative min-w-0 flex-1">
        <Input
          ref={ref}
          type="search"
          name="conversation-message-search"
          aria-label="Search messages in this conversation"
          placeholder="Search in conversation..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          leftIcon={<Search size={16} />}
          className="pr-18"
        />
        {resultLabel && (
          <output
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-muted px-2 py-0.5 font-semibold text-slate-muted text-xs"
            aria-live="polite"
          >
            {resultLabel}
          </output>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onPreviousResult}
          disabled={isNavigationDisabled}
          aria-label="Previous search result"
        >
          <ChevronUp className="size-4" strokeWidth={2.25} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onNextResult}
          disabled={isNavigationDisabled}
          aria-label="Next search result"
        >
          <ChevronDown className="size-4" strokeWidth={2.25} />
        </Button>
      </div>
    </div>
  );
}
