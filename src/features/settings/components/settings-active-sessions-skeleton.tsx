import { SettingsSessionRowSkeleton } from "./settings-session-row-skeleton";

export function SettingsActiveSessionsSkeleton() {
  return (
    <div aria-busy="true" className="border-border border-t">
      <output className="sr-only">Loading active sessions</output>
      {["current", "mobile"].map((item, index) => (
        <SettingsSessionRowSkeleton key={item} active={index === 0} />
      ))}
    </div>
  );
}
