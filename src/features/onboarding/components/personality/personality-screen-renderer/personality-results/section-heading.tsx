interface SectionHeadingProps {
  eyebrow: string;
  title: string;
}

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-black uppercase tracking-widest text-forge-teal">
        {eyebrow}
      </p>
      <h2 className="text-xl font-black tracking-tight text-ink">{title}</h2>
    </div>
  );
}
