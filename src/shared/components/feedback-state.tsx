import type { ReactNode } from "react";

import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

interface FeedbackStateProps {
  actions?: ReactNode;
  className?: string;
  containerClassName?: string;
  description: string;
  descriptionClassName?: string;
  fullPage?: boolean;
  headingId: string;
  icon?: ReactNode;
  iconClassName?: string;
  title: string;
  visual?: ReactNode;
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
  visual,
}: FeedbackStateProps) {
  return (
    <div
      className={cn(
        "grid place-items-center px-4 py-12",
        containerClassName,
        fullPage ? "fixed inset-0 z-50 bg-canvas" : "min-h-dvh",
      )}
    >
      <section
        aria-labelledby={headingId}
        className={cn(
          "w-full max-w-md px-6 py-8 text-center sm:px-8",
          className,
        )}
      >
        {visual ? (
          <div
            className="mx-auto mb-6 flex max-w-44 justify-center"
            aria-hidden="true"
          >
            {visual}
          </div>
        ) : icon ? (
          <IconTile
            tone="none"
            size="xl"
            shape="square"
            className={cn("mx-auto mb-5 rounded-2xl", iconClassName)}
            aria-hidden="true"
          >
            {icon}
          </IconTile>
        ) : null}

        <h1 id={headingId} className="font-bold text-2xl text-ink">
          {title}
        </h1>
        <p
          className={cn(
            "mx-auto mt-3 max-w-sm text-slate-muted text-sm leading-relaxed",
            descriptionClassName,
          )}
        >
          {description}
        </p>

        {actions ? (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>
        ) : null}
      </section>
    </div>
  );
}
