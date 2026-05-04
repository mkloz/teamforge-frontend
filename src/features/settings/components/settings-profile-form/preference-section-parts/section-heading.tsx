interface SectionHeadingProps {
  title: string;
  description: string;
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-muted">
        {description}
      </p>
    </div>
  );
}
