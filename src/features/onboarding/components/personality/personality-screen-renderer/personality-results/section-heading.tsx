interface SectionHeadingProps {
  eyebrow: string;
  title: string;
}

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-black text-forge-teal text-xs uppercase tracking-widest">
        {eyebrow}
      </p>
      <h2 className="font-black text-ink text-xl tracking-tight">{title}</h2>
    </div>
  );
}
