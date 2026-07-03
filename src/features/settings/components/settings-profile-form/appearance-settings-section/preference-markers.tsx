interface PreferenceMarkersProps {
  isDefault: boolean;
  selected: boolean;
}

export function PreferenceMarkers({
  isDefault,
  selected,
}: PreferenceMarkersProps) {
  if (!(isDefault || selected)) {
    return null;
  }

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {isDefault ? <DefaultBadge /> : null}
      {selected ? (
        <span className="font-bold text-primary text-xs">Active</span>
      ) : null}
    </span>
  );
}

function DefaultBadge() {
  return (
    <span className="rounded-full border border-border bg-input px-2 py-0.5 font-bold text-slate-muted text-xs leading-none">
      Default
    </span>
  );
}
