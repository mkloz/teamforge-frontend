import type { ReactNode } from "react";

interface LayerBlockProps {
  children: ReactNode;
  description?: string;
  title: string;
}

export function LayerBlock({ children, description, title }: LayerBlockProps) {
  return (
    <section className="min-w-0">
      <div className="min-w-0">
        <h3 className="font-bold text-base text-ink">{title}</h3>
        {description ? (
          <p className="mt-1 text-pretty text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
