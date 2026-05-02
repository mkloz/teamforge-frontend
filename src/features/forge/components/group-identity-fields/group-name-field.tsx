import { Sparkles, X } from "lucide-react";
import type { RefObject } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface GroupNameFieldProps {
  groupName: string;
  inputRef: RefObject<HTMLInputElement | null>;
  nameFocused: boolean;
  nameId: string;
  onFocusChange: (focused: boolean) => void;
  onGroupNameChange: (value: string) => void;
  suggestions: string[];
}

export function GroupNameField({
  groupName,
  inputRef,
  nameFocused,
  nameId,
  onFocusChange,
  onGroupNameChange,
  suggestions,
}: GroupNameFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={nameId}
        className="block text-xs font-semibold text-muted-foreground/70"
      >
        Name
      </label>
      <div
        className={cn(
          "relative flex items-center rounded-xl border bg-background/60 transition-colors duration-150",
          nameFocused
            ? "border-primary/60 ring-2 ring-primary/12 bg-background"
            : "border-border/60",
        )}
      >
        <Sparkles
          size={13}
          className={cn(
            "absolute left-3 pointer-events-none transition-colors shrink-0",
            nameFocused ? "text-primary/60" : "text-muted-foreground/30",
          )}
        />
        <input
          id={nameId}
          ref={inputRef}
          type="text"
          value={groupName}
          maxLength={40}
          autoComplete="off"
          placeholder="e.g. Iron Collective"
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          onChange={(event) => onGroupNameChange(event.target.value)}
          className="w-full h-11 pl-8 pr-8 bg-transparent text-sm font-medium placeholder:text-muted-foreground/35 focus:outline-none rounded-xl"
        />
        {groupName && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onGroupNameChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            aria-label="Clear name"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {suggestions.map((name) => (
            <Button
              key={name}
              variant="ghost"
              size="xs"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onGroupNameChange(name);
                inputRef.current?.blur();
              }}
              className={cn(
                "h-auto px-2 py-1 rounded-lg border text-micro font-semibold transition-colors duration-150",
                groupName === name
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/50 bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
              )}
            >
              <Sparkles size={9} className="shrink-0 opacity-60" />
              {name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
