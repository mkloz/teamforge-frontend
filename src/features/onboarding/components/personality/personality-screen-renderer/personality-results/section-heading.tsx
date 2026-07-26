interface SectionHeadingProps {
  title: string;
}

export function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <h2 className="font-black text-ink text-xl tracking-tight">{title}</h2>
  );
}
