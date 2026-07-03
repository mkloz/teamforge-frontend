import type { ReactNode } from "react";

interface LayerBlockProps {
  children: ReactNode;
  description: string;
  index: string;
  title: string;
}

export function LayerBlock({
  children,
  description,
  index,
  title,
}: LayerBlockProps) {
  return (
    <section className="min-w-0">
      <div className="flex items-start gap-3">
        <p className="mt-1 w-6 shrink-0 font-black text-primary text-xs">
          {index}
        </p>
        <div className="min-w-0">
          <h3 className="font-black text-base text-ink">{title}</h3>
          <p className="mt-1 text-pretty text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}
