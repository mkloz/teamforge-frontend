import { PlanCover } from "@/shared/components/common/plan-cover";
import { cn } from "@/shared/lib/utils";

export function PlanSummaryPoster({
  coverImage,
  eyebrow,
  title,
}: {
  coverImage: string;
  eyebrow: string | null | undefined;
  title: string;
}) {
  return (
    <div className="relative isolate aspect-video overflow-hidden rounded-2xl bg-muted">
      <PlanCover
        value={coverImage}
        alt=""
        className="absolute inset-0 size-full overflow-hidden rounded-2xl"
        imageClassName="size-full rounded-2xl object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-black/35 px-4 py-3 backdrop-blur-[3px]">
        {eyebrow ? (
          <p className="mb-1 line-clamp-1 font-semibold text-white/70 text-xs">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="line-clamp-2 text-balance font-black text-white text-xl leading-tight tracking-tight">
          {title}
        </h3>
      </div>
    </div>
  );
}

export function PlanSummaryTitleBlock({
  eyebrow,
  title,
}: {
  eyebrow: string | null | undefined;
  title: string;
}) {
  return (
    <div className="border-border/35 border-y py-5">
      {eyebrow ? (
        <p className="mb-1.5 font-semibold text-muted-foreground text-xs">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="text-balance font-black text-3xl text-foreground leading-none tracking-tight">
        {title}
      </h3>
    </div>
  );
}

export function PlanSummaryFact({
  active = false,
  label,
  value,
}: {
  active?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-[2.5rem_auto_minmax(0,1fr)] items-baseline gap-1.5 border-l-2 py-2.5 pl-3 transition-colors",
        active ? "border-brand-teal" : "border-transparent",
      )}
    >
      <dt
        className={cn(
          "font-semibold text-muted-foreground text-xs transition-colors",
          active && "text-foreground",
        )}
      >
        {label}
      </dt>
      <span aria-hidden="true" className="text-muted-foreground/35 text-xs">
        —
      </span>
      <dd className="line-clamp-2 text-pretty font-semibold text-foreground text-sm leading-snug">
        {value}
      </dd>
    </div>
  );
}
