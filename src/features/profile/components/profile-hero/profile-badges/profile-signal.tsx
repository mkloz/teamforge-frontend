import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface ProfileSignalProps {
  accent?: string;
  label: string;
  value: ReactNode;
}

export function ProfileSignal({
  accent = "text-ink",
  label,
  value,
}: ProfileSignalProps) {
  return (
    <div className="min-w-0 text-left">
      <p className="font-semibold text-[11px] text-slate-muted sm:text-xs">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-extrabold text-xs leading-tight underline-offset-2 group-hover:underline sm:text-sm md:text-base",
          accent,
        )}
      >
        {value}
      </p>
    </div>
  );
}
