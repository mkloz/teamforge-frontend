import { SegmentedTabs } from "@/shared/components/ui/segmented-tabs";
import type { ThemeAppearance as ThemeAppearanceValue } from "@/shared/constants/theme-preferences";
import { APPEARANCE_OPTIONS } from "./appearance-options";
import { LayerBlock } from "./layer-block";

interface ModeLayerProps {
  selectedAppearance: ThemeAppearanceValue;
  disabled: boolean;
  onSelect: (value: ThemeAppearanceValue) => void;
}

export function ModeLayer({
  selectedAppearance,
  disabled,
  onSelect,
}: ModeLayerProps) {
  return (
    <LayerBlock
      title="Mode"
      description="Follow your device, or pin one mode for this account."
    >
      <SegmentedTabs
        ariaLabel="Appearance mode"
        className="mt-4 w-full max-w-96"
        disabled={disabled}
        fill
        options={APPEARANCE_OPTIONS}
        size="sm"
        value={selectedAppearance}
        onChange={onSelect}
      />
    </LayerBlock>
  );
}
