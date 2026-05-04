interface StatPillProps {
  label: string;
  value: string | number | undefined | null;
}

export function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="border-l border-border pl-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-base font-semibold text-ink">
        {value ?? "Not set"}
      </p>
    </div>
  );
}
