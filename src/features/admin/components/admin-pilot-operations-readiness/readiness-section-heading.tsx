import type { LucideIcon } from "lucide-react";

export function ReadinessSectionHeading({
  description,
  icon: Icon,
  id,
  title,
}: {
  description: string;
  icon: LucideIcon;
  id: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 id={id} className="font-semibold text-base text-ink">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
