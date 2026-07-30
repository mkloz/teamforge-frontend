import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface AccountSettingsCardProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description: string;
  title: string;
}

export function AccountSettingsCard({
  children,
  className,
  contentClassName,
  description,
  title,
}: AccountSettingsCardProps) {
  return (
    <section className={cn("rounded-3xl bg-card p-3 sm:p-6", className)}>
      <div>
        <h3 className="font-semibold text-ink text-lg leading-tight">
          {title}
        </h3>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className={cn("mt-4 sm:mt-6", contentClassName)}>{children}</div>
    </section>
  );
}
