import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
import { cn } from "@/shared/lib/utils";
import { buildSafetyNavigation } from "@/shared/navigation/safety-navigation";

export function SafetyDetailShell({
  children,
  title,
  description,
  status,
}: {
  children: ReactNode;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <Button asChild variant="ghost" className="w-fit px-2">
        <Link {...buildSafetyNavigation()}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Safety Center
        </Link>
      </Button>

      <header className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <StatusPill label={status} />
        <div className="grid gap-1">
          <h1 className="text-balance font-bold text-2xl text-ink">{title}</h1>
          <p className="text-pretty text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </header>

      {children}
    </div>
  );
}

export function SafetyDetailCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-bold text-ink text-xl">{title}</h2>
      {children}
    </section>
  );
}

export function DetailRows({
  rows,
}: {
  rows: Array<{ label: string; value: string | null }>;
}) {
  return (
    <dl className="grid gap-3 text-sm">
      {rows
        .filter((row) => row.value)
        .map((row) => (
          <div
            key={row.label}
            className="grid gap-1 border-border border-b pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="font-semibold text-slate-muted">{row.label}</dt>
            <dd className="wrap-break-word text-ink">{row.value}</dd>
          </div>
        ))}
    </dl>
  );
}

export function SafetyOfflineNotice() {
  return (
    <Notice tone="warning" role="status">
      You’re offline. Status updates may be out of date.
    </Notice>
  );
}

export function ReviewStatus({
  label,
  submittedAt,
  decidedAt,
}: {
  label: string;
  submittedAt: string;
  decidedAt?: string | null;
}) {
  return (
    <div className="grid gap-3 rounded-xl bg-muted/45 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-ink text-sm">{label}</span>
        <span className="inline-flex items-center gap-1.5 text-slate-muted text-xs">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {new Date(submittedAt).toLocaleDateString("en-GB", {
            dateStyle: "medium",
          })}
        </span>
      </div>
      {decidedAt ? (
        <p className="text-slate-muted text-xs">
          Decided{" "}
          {new Date(decidedAt).toLocaleDateString("en-GB", {
            dateStyle: "medium",
          })}
        </p>
      ) : null}
    </div>
  );
}

export function StatusPill({
  label,
  tone = "teal",
}: {
  label: string;
  tone?: "teal" | "amber" | "neutral";
}) {
  return (
    <span
      className={cn(
        "w-fit rounded-full px-3 py-1 font-semibold text-xs",
        tone === "teal" && "bg-primary/10 text-primary",
        tone === "amber" && "bg-accent/12 text-ink",
        tone === "neutral" && "bg-muted text-slate-muted",
      )}
    >
      {label}
    </span>
  );
}
