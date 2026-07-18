import { MapPin, Video } from "lucide-react";
import { SegmentedTabs } from "@/shared/components/ui/segmented-tabs";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import type { ForgeScope } from "./types";

const SCOPE_OPTIONS = [
  { id: "LOCAL", label: "Local", icon: MapPin },
  { id: "ONLINE", label: "Online", icon: Video },
] as const;

export function ScopeSection({
  onChange,
  value,
}: {
  onChange: (value: ForgeScope) => void;
  value: ForgeScope;
}) {
  return (
    <SectionCard>
      <SectionHeader title="Where will it happen?" />
      <SegmentedTabs
        ariaLabel="Where the activity will happen"
        className="self-start"
        options={SCOPE_OPTIONS}
        size="lg"
        value={value}
        onChange={onChange}
      />
      <p className="text-muted-foreground text-xs leading-relaxed">
        {value === "LOCAL"
          ? "TeamForge uses your saved area and distance preference. You can still decide the exact venue together."
          : "Choose this for an activity the group can do online. The meeting link can be decided later."}
      </p>
    </SectionCard>
  );
}
