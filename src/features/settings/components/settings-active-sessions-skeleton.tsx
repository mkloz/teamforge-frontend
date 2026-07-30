import { GroupedMenuList } from "@/shared/components/ui/grouped-menu";
import { SettingsSessionRowSkeleton } from "./settings-session-row-skeleton";

export function SettingsActiveSessionsSkeleton() {
  return (
    <GroupedMenuList aria-busy="true">
      <output className="sr-only">Loading active sessions</output>
      {["current", "mobile"].map((item, index) => (
        <SettingsSessionRowSkeleton key={item} active={index === 0} />
      ))}
    </GroupedMenuList>
  );
}
