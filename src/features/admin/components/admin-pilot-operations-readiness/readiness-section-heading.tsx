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
    <div className="grid gap-1">
      <h2
        id={id}
        className="flex items-center gap-2 font-semibold text-base text-ink"
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
