interface StatPillProps {
  label: string;
  value: string | number | undefined | null;
}

export function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="border-border border-l pl-4">
      <p className="font-semibold text-slate-muted text-xs uppercase tracking-widest">
        {label}
      </p>
      <p className="mt-1 break-words font-semibold text-base text-ink">
        {value ?? "Not set"}
      </p>
    </div>
  );
}
