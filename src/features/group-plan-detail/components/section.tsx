import type { ReactNode, Ref } from "react";
import { cn } from "@/shared/lib/utils";

interface SectionProps {
  eyebrow?: string;
  heading: string;
  description?: string;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  sectionRef?: Ref<HTMLElement>;
  isHighlighted?: boolean;
  headingId?: string;
  divider?: boolean;
}

export function Section({
  eyebrow,
  heading,
  description,
  trailing,
  children,
  className,
  contentClassName,
  sectionRef,
  isHighlighted = false,
  headingId,
  divider = true,
}: SectionProps) {
  return (
    <section
      ref={sectionRef}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-24 transition-colors duration-500",
        divider && "border-border/70 border-b pb-9",
        isHighlighted &&
          "-mx-3 rounded-2xl bg-forge-teal/5 px-3 ring-2 ring-forge-teal/25 ring-offset-4 ring-offset-background",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="font-bold text-forge-teal text-xs">{eyebrow}</p>
            ) : null}
            <h2
              id={headingId}
              className="mt-2 font-black text-2xl text-foreground tracking-tight md:text-3xl"
            >
              {heading}
            </h2>
            {description ? (
              <p className="mt-2 max-w-2xl font-medium text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>

      <div className={cn("mt-6", contentClassName)}>{children}</div>
    </section>
  );
}
