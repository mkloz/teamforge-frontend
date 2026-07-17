import type { LucideIcon } from "lucide-react";
import { StatusPill } from "@/shared/components/ui/status-pill";

interface AdminReadOnlySectionProps {
  description: string;
  icon: LucideIcon;
  title: string;
}

export function AdminReadOnlySection({
  description,
  icon: Icon,
  title,
}: AdminReadOnlySectionProps) {
  return (
    <section className="grid gap-4 border-border border-t py-6 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-base text-ink">{title}</h2>
            <StatusPill size="xs" surface="soft" tone="neutral">
              Read only
            </StatusPill>
          </div>
          <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
