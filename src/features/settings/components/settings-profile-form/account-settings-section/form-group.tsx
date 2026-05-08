import type { ReactNode } from "react";

interface FormGroupProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function FormGroup({ title, description, children }: FormGroupProps) {
  return (
    <section className="border-border border-t pt-7">
      <div className="mb-5 max-w-2xl">
        <h3 className="font-semibold text-ink text-lg">{title}</h3>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
