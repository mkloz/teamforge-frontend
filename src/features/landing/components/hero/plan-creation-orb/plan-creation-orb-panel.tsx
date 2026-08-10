import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type GroupConvergenceVisualPanelProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
};

export function GroupConvergenceVisualPanel({
  children,
  className,
  ...props
}: GroupConvergenceVisualPanelProps) {
  return (
    <div
      className={cn(
        "transform-gpu rounded-xl border border-brand-teal/20 bg-hero-deep-panel/80 px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {children}
    </div>
  );
}

export function GroupConvergenceVisualEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-sans font-semibold text-slate-muted text-xs",
        className,
      )}
    >
      {children}
    </p>
  );
}
