import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface GroupActionButtonProps {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "muted";
}

export function GroupActionButton({
  disabled = false,
  icon,
  label,
  onClick,
  variant = "default",
}: GroupActionButtonProps) {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-auto w-full justify-start gap-4 rounded-xl border border-transparent px-3 py-2.5 shadow-none transition-all duration-200 group",
        variant === "default" && "text-ink hover:bg-muted/80",
        variant === "destructive" &&
          "text-red-500 hover:border-red-500/20 hover:bg-red-500/10",
        variant === "muted" && "text-slate-muted hover:bg-muted hover:text-ink",
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-lg p-2 transition-colors",
          variant === "default" &&
            "bg-muted group-hover:bg-ink group-hover:text-white",
          variant === "destructive" &&
            "bg-red-500/10 group-hover:bg-red-500 group-hover:text-white",
          variant === "muted" &&
            "bg-muted/50 group-hover:bg-ink group-hover:text-white",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </Button>
  );
}
