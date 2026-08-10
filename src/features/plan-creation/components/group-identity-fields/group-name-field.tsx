import { PenLine, Type, X } from "lucide-react";
import type { RefObject } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

interface GroupNameFieldProps {
  groupName: string;
  inputRef: RefObject<HTMLInputElement | null>;
  nameId: string;
  onGroupNameChange: (value: string) => void;
  suggestions: string[];
}

export function GroupNameField({
  groupName,
  inputRef,
  nameId,
  onGroupNameChange,
  suggestions,
}: GroupNameFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label
        htmlFor={nameId}
        className="block font-semibold text-muted-foreground/70 text-xs"
      >
        Name
      </Label>
      <Input
        id={nameId}
        ref={inputRef}
        type="text"
        value={groupName}
        maxLength={40}
        autoComplete="off"
        placeholder="e.g. Iron Collective"
        onChange={(event) => onGroupNameChange(event.target.value)}
        leftIcon={<Type size={13} />}
        rightIcon={
          groupName ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onGroupNameChange("");
                inputRef.current?.focus();
              }}
              className="size-7 rounded-full text-muted-foreground/40 hover:text-muted-foreground"
              aria-label="Clear name"
            >
              <X size={13} />
            </Button>
          ) : null
        }
      />

      {suggestions.length > 0 && (
        <div className="flex max-w-full flex-wrap gap-1.5 pt-1">
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
                "h-auto rounded-lg border px-2 py-1 font-semibold text-xs transition-colors duration-150",
                groupName === name
                  ? "border-brand-teal/40 bg-primary-soft text-foreground"
                  : "border-border/50 bg-card text-muted-foreground hover:border-foreground/35 hover:text-foreground",
              )}
            >
              <PenLine size={9} className="shrink-0 opacity-60" />
              {name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
