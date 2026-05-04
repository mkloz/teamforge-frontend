import type { ReactNode } from "react";

interface FormGroupProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function FormGroup({ title, description, children }: FormGroupProps) {
  return (
    <section className="border-t border-border pt-7">
      <div className="mb-5 max-w-2xl">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-muted">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
