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
    <div className="space-y-1.5">
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
                "h-auto rounded-lg border px-2 py-1 font-semibold text-micro transition-colors duration-150",
                groupName === name
                  ? "border-forge-teal/40 bg-forge-teal/10 text-forge-teal"
                  : "border-border/50 bg-card text-muted-foreground hover:border-forge-teal/30 hover:bg-forge-teal/5 hover:text-foreground",
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
