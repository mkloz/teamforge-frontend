import { X, ChevronLeft, Check, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ForgeResult } from "../lib/forge-contract";

interface ForgeHeaderProps {
  title: string;
  entity: string;
  sub: string;
  canGoBack: boolean;
  onBack: () => void;
  onClose: () => void;
  forgeResult: ForgeResult;
}

const ENTITY_PILL_COLORS: Record<string, string> = {
  Activity: "bg-muted text-muted-foreground",
  Plan: "bg-primary/10 text-primary",
  Group: "bg-accent/15 text-accent",
  Success: "bg-forge-teal/10 text-forge-teal",
  Failed: "bg-destructive/10 text-destructive",
  Identity: "bg-muted text-muted-foreground",
  Invite: "bg-muted text-muted-foreground",
};

export function ForgeHeader({
  title,
  entity,
  sub,
  canGoBack,
  onBack,
  onClose,
  forgeResult,
}: ForgeHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 md:px-10 pt-10 md:pt-8 pb-4">
      <div className="flex items-center gap-3">
        {canGoBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            aria-label="Go back"
            className="size-8 p-0 rounded-full text-slate-muted hover:text-ink shrink-0"
          >
            <ChevronLeft size={18} />
          </Button>
        ) : (
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
              forgeResult === "SUCCESS" ? "bg-primary/10" : "bg-accent/10",
            )}
            aria-hidden="true"
          >
            {forgeResult === "SUCCESS" ? (
              <Check size={15} className="text-primary" />
            ) : (
              <Zap size={15} className="text-accent fill-current" />
            )}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-bold text-foreground leading-none">
              {title}
            </h2>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-micro font-bold uppercase tracking-wide",
                ENTITY_PILL_COLORS[entity] ?? "bg-muted text-muted-foreground",
              )}
            >
              {entity}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        aria-label="Close"
        className="size-8 p-0 rounded-full text-slate-muted hover:text-ink shrink-0"
      >
        <X size={16} />
      </Button>
    </div>
  );
}
