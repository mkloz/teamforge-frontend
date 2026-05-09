import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface FeedbackStateProps {
  actions?: ReactNode;
  className?: string;
  containerClassName?: string;
  description: string;
  descriptionClassName?: string;
  fullPage?: boolean;
  headingId: string;
  icon: ReactNode;
  iconClassName: string;
  title: string;
}

export function FeedbackState({
  actions,
  className,
  containerClassName,
  description,
  descriptionClassName,
  fullPage = false,
  headingId,
  icon,
  iconClassName,
  title,
}: FeedbackStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center px-4 py-10",
        fullPage ? "min-h-screen bg-canvas" : "min-h-96",
        containerClassName,
      )}
    >
      <section
        aria-labelledby={headingId}
        className={cn(
          "w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm",
          className,
        )}
      >
        <div
          className={cn(
            "mb-4 flex size-12 items-center justify-center rounded-lg",
            iconClassName,
          )}
          aria-hidden="true"
        >
          {icon}
        </div>

        <h1 id={headingId} className="font-bold text-2xl text-ink">
          {title}
        </h1>
        <p
          className={cn(
            "mt-2 text-slate-muted text-sm leading-relaxed",
            descriptionClassName,
          )}
        >
          {description}
        </p>

        {actions ? (
          <div className="mt-5 flex flex-wrap gap-3">{actions}</div>
        ) : null}
      </section>
    </div>
  );
}
