import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface DevToolIconButtonProps {
  active?: boolean;
  children: ReactNode;
  expanded?: boolean;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}

export function DevToolIconButton({
  active = false,
  children,
  expanded,
  label,
  onClick,
  pressed,
}: DevToolIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-expanded={expanded}
          aria-label={label}
          aria-pressed={pressed}
          className={cn(
            "size-9 shrink-0 rounded-full border border-border/70 bg-card/95 p-0 text-muted-foreground shadow-sm backdrop-blur-md hover:border-foreground/20 hover:bg-muted hover:text-foreground",
            active &&
              "border-primary/45 bg-primary/12 text-primary hover:border-primary/55 hover:bg-primary/18",
          )}
          onClick={onClick}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}
