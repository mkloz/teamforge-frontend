interface SectionHeadingProps {
  title: string;
  description?: string;
  headingId?: string;
}

export function SectionHeading({
  title,
  description,
  headingId,
}: SectionHeadingProps) {
  return (
    <div className="flex max-w-2xl items-start gap-3">
      <div className="min-w-0">
        <h2 id={headingId} className="font-bold text-ink text-xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
