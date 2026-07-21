import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type ForgeOrbPanelProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
};

export function ForgeOrbPanel({
  children,
  className,
  ...props
}: ForgeOrbPanelProps) {
  return (
    <div
      className={cn(
        "transform-gpu rounded-xl border border-forge-teal/20 bg-forge-deep-panel/80 px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {children}
    </div>
  );
}

export function ForgeOrbEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-sans font-semibold text-forge-teal text-xs opacity-90",
        className,
      )}
    >
      {children}
    </p>
  );
}
