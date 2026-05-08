interface SectionHeadingProps {
  title: string;
  description: string;
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-bold text-ink text-xl">{title}</h2>
      <p className="mt-1 text-slate-muted text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
