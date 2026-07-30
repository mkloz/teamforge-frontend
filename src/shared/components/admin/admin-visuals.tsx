import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export type AdminTone = "danger" | "muted" | "success" | "warning";

const TONE_STYLES: Record<
  AdminTone,
  { bar: string; dot: string; text: string }
> = {
  danger: {
    bar: "bg-danger",
    dot: "bg-danger",
    text: "text-danger",
  },
  muted: {
    bar: "bg-slate-muted/35",
    dot: "bg-slate-muted/55",
    text: "text-slate-muted",
  },
  success: {
    bar: "bg-primary",
    dot: "bg-primary",
    text: "text-primary",
  },
  warning: {
    bar: "bg-accent",
    dot: "bg-accent",
    text: "text-accent",
  },
};

export function AdminSummaryStrip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-0.5 overflow-hidden rounded-2xl bg-background sm:grid-cols-2 2xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function AdminSummaryMetric({
  detail,
  label,
  tone = "muted",
  value,
}: {
  detail?: ReactNode;
  label: string;
  tone?: AdminTone;
  value: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-1 rounded-xl bg-card px-5 py-4">
      <dt className="flex items-center gap-2 font-semibold text-slate-muted text-xs">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            TONE_STYLES[tone].dot,
          )}
          aria-hidden="true"
        />
        {label}
      </dt>
      <dd
        className={cn(
          "font-semibold text-2xl tracking-tight",
          TONE_STYLES[tone].text,
        )}
      >
        {value}
      </dd>
      {detail ? (
        <p className="truncate text-slate-muted text-xs">{detail}</p>
      ) : null}
    </div>
  );
}

export function AdminSectionHeader({
  action,
  description,
  eyebrow,
  icon: Icon,
  id,
  title,
}: {
  action?: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  icon?: LucideIcon;
  id?: string;
  title: string;
}) {
  return (
    <header className="main-action-grid grid items-end gap-x-5 gap-y-1.5">
      <div className="grid gap-1">
        {eyebrow ? (
          <p className="font-semibold text-primary text-xs">{eyebrow}</p>
        ) : null}
        <h2
          id={id}
          className="flex items-center gap-2.5 font-semibold text-ink text-xl"
        >
          {Icon ? (
            <Icon className="size-5 shrink-0" aria-hidden="true" />
          ) : null}
          <span>{title}</span>
        </h2>
        {description ? (
          <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="sm:justify-self-end">{action}</div> : null}
    </header>
  );
}

export interface AdminSegment {
  label: string;
  tone: AdminTone;
  value: number;
}

export function AdminSegmentedBar({
  label,
  segments,
}: {
  label: string;
  segments: AdminSegment[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="grid gap-3">
      <div
        aria-label={`${label}: ${segments
          .map((segment) => `${segment.label} ${segment.value}`)
          .join(", ")}`}
        className="flex h-2.5 gap-1 overflow-hidden rounded-full"
        role="img"
      >
        {total === 0 ? (
          <span className="size-full rounded-full bg-muted" />
        ) : (
          segments.map((segment) =>
            segment.value > 0 ? (
              <span
                key={segment.label}
                className={cn(
                  "h-full min-w-1 rounded-full transition-[width] duration-500",
                  TONE_STYLES[segment.tone].bar,
                )}
                style={{ width: `${(segment.value / total) * 100}%` }}
              />
            ) : null,
          )
        )}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((segment) => (
          <span
            key={segment.label}
            className="inline-flex items-center gap-2 text-slate-muted text-xs"
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                TONE_STYLES[segment.tone].dot,
              )}
              aria-hidden="true"
            />
            {segment.label}
            <strong className="font-semibold text-ink tabular-nums">
              {segment.value}
            </strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export function AdminStatusLabel({
  children,
  tone,
}: {
  children: ReactNode;
  tone: AdminTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold text-xs",
        TONE_STYLES[tone].text,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", TONE_STYLES[tone].dot)}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
