import { X, ChevronLeft, Check, Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ForgeResult } from "../types/forge.types";

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
  Success: "bg-emerald-500/10 text-emerald-600",
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
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
              forgeResult === "success" ? "bg-primary/10" : "bg-accent/10",
            )}
            aria-hidden="true"
          >
            {forgeResult === "success" ? (
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
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                ENTITY_PILL_COLORS[entity] ?? "bg-muted text-muted-foreground",
              )}
            >
              {entity}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}
