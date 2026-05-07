interface StatPillProps {
  label: string;
  value: string | number | undefined | null;
}

export function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="border-l border-border pl-4">
      <p className="text-xs font-semibold tracking-widest text-slate-muted uppercase">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold break-words text-ink">
        {value ?? "Not set"}
      </p>
    </div>
  );
}
