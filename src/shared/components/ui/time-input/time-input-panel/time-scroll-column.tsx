import { ChevronDown, ChevronUp } from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/shared/components/ui/button";
import {
  getEmptyTimeScrollSnapshot,
  getTimeScrollSnapshot,
  subscribeToTimeScrollNode,
} from "@/shared/components/ui/time-input/scroll-state";
import { scrollElementBy } from "@/shared/lib/browser-scroll";
import { cn } from "@/shared/lib/utils";

interface TimeScrollColumnProps<T extends number | string> {
  activeRef?: (node: HTMLButtonElement | null) => void;
  ariaLabel: string;
  getKey?: (option: T) => string;
  getOptionLabel: (option: T) => ReactNode;
  isSelected: (option: T) => boolean;
  onKeyDown: (option: T, event: KeyboardEvent<HTMLButtonElement>) => void;
  onSelect: (option: T) => void;
  options: T[];
  title: string;
}

export function TimeScrollColumn<T extends number | string>({
  activeRef,
  ariaLabel,
  getKey = String,
  getOptionLabel,
  isSelected,
  onKeyDown,
  onSelect,
  options,
  title,
}: TimeScrollColumnProps<T>) {
  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);
  const scrollSnapshot = useSyncExternalStore(
    (onStoreChange) => subscribeToTimeScrollNode(scrollNode, onStoreChange),
    () => getTimeScrollSnapshot(scrollNode),
    getEmptyTimeScrollSnapshot,
  );
  const canScrollUp = scrollSnapshot[0] === "1";
  const canScrollDown = scrollSnapshot[1] === "1";

  const scrollByDirection = (direction: 1 | -1) => {
    scrollElementBy(scrollNode, {
      intent: "locate",
      top: direction * 72,
    });
  };

  return (
    <fieldset
      aria-label={ariaLabel}
      className="m-0 flex min-w-0 flex-col border-0 px-1.5 py-0"
    >
      <legend className="w-full px-0 pb-2 text-center font-semibold text-slate-muted text-xs">
        {title}
      </legend>
      <div className="relative flex min-h-56 flex-1 items-center">
        <div
          ref={setScrollNode}
          className="[&::-webkit-scrollbar]:hidden! scrollbar-hide flex max-h-56 w-full flex-col gap-1 overflow-y-auto py-7 [&::-webkit-scrollbar]:w-0!"
        >
          {options.map((option) => {
            const selected = isSelected(option);

            return (
              <div key={getKey(option)} className="flex justify-center">
                <Button
                  ref={(node) => {
                    if (selected) {
                      activeRef?.(node);
                    }
                  }}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={selected}
                  tabIndex={selected ? 0 : -1}
                  className={cn(
                    "h-8 w-full max-w-16 rounded-full text-xs tabular-nums",
                    selected &&
                      "border-primary bg-primary text-primary-foreground",
                  )}
                  onKeyDown={(event) => onKeyDown(option, event)}
                  onClick={() => onSelect(option)}
                >
                  {getOptionLabel(option)}
                </Button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={`Scroll ${title.toLowerCase()} up`}
          disabled={!canScrollUp}
          className={cn(
            "absolute inset-x-0 top-0 z-10 flex h-10 items-start justify-center bg-linear-to-b from-card via-card/85 to-transparent pt-1 text-slate-muted transition-all duration-200",
            canScrollUp
              ? "opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0",
          )}
          onClick={() => scrollByDirection(-1)}
        >
          <ChevronUp size={14} className="rounded-full bg-white/5 shadow-lg" />
        </button>
        <button
          type="button"
          aria-label={`Scroll ${title.toLowerCase()} down`}
          disabled={!canScrollDown}
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 flex h-10 items-end justify-center bg-linear-to-t from-card via-card/85 to-transparent pb-1 text-slate-muted transition-all duration-200",
            canScrollDown
              ? "opacity-100"
              : "pointer-events-none translate-y-1 opacity-0",
          )}
          onClick={() => scrollByDirection(1)}
        >
          <ChevronDown
            size={14}
            className="rounded-full bg-white/5 shadow-lg"
          />
        </button>
      </div>
    </fieldset>
  );
}
