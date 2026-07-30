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
  trailingInline?: boolean;
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
  trailingInline = false,
}: SectionProps) {
  const sectionClassName = getSectionClassName({
    className,
    divider,
    isHighlighted,
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby={headingId}
      className={sectionClassName}
    >
      <SectionHeader
        eyebrow={eyebrow}
        heading={heading}
        description={description}
        headingId={headingId}
        trailing={trailing}
        trailingInline={trailingInline}
      />

      <div className={cn("mt-5", contentClassName)}>{children}</div>
    </section>
  );
}

function getSectionClassName({
  className,
  divider,
  isHighlighted,
}: Pick<SectionProps, "className" | "divider" | "isHighlighted">) {
  return cn(
    "scroll-mt-24 transition-colors duration-500",
    divider && "border-border/70 border-b pb-8",
    isHighlighted &&
      "-mx-3 rounded-2xl bg-forge-teal/5 px-3 ring-2 ring-forge-teal/25 ring-offset-4 ring-offset-background",
    className,
  );
}

function SectionHeader({
  eyebrow,
  heading,
  description,
  headingId,
  trailing,
  trailingInline,
}: Pick<
  SectionProps,
  | "description"
  | "eyebrow"
  | "heading"
  | "headingId"
  | "trailing"
  | "trailingInline"
>) {
  return (
    <div
      className={cn(
        "flex gap-3",
        trailingInline
          ? "flex-row items-start justify-between"
          : "flex-col md:flex-row md:items-start md:justify-between",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="min-w-0">
          <SectionEyebrow eyebrow={eyebrow} />
          <h2
            id={headingId}
            className={cn(
              "font-bold text-foreground text-xl tracking-tight md:text-2xl",
              eyebrow && "mt-1.5",
            )}
          >
            {heading}
          </h2>
          <SectionDescription description={description} />
        </div>
      </div>
      <SectionTrailing trailing={trailing} />
    </div>
  );
}

function SectionEyebrow({ eyebrow }: Pick<SectionProps, "eyebrow">) {
  if (!eyebrow) {
    return null;
  }

  return <p className="font-bold text-forge-teal text-xs">{eyebrow}</p>;
}

function SectionDescription({
  description,
}: Pick<SectionProps, "description">) {
  if (!description) {
    return null;
  }

  return (
    <p className="mt-1.5 max-w-2xl font-medium text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
  );
}

function SectionTrailing({ trailing }: Pick<SectionProps, "trailing">) {
  if (!trailing) {
    return null;
  }

  return <div className="shrink-0">{trailing}</div>;
}
