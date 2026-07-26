interface SectionHeadingProps {
  title: string;
  description?: string;
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="flex max-w-2xl items-start gap-3">
      <div className="min-w-0">
        <h2 className="font-bold text-ink text-xl">{title}</h2>
        {description ? (
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
