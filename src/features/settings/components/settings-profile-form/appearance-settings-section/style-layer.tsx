import {
  DEFAULT_THEME_STYLE,
  type ThemeStyle as ThemeStyleValue,
} from "@/shared/constants/theme-preferences";
import { STYLE_OPTIONS } from "./appearance-options";
import { getLastGridRowStartIndex } from "./grid-row-index";
import { LayerBlock } from "./layer-block";
import { StyleOptionRow } from "./style-option-row";

interface StyleLayerProps {
  selectedThemeStyle: ThemeStyleValue;
  disabled: boolean;
  onSelect: (value: ThemeStyleValue) => void;
}

export function StyleLayer({
  selectedThemeStyle,
  disabled,
  onSelect,
}: StyleLayerProps) {
  return (
    <LayerBlock
      index="02"
      title="Art style"
      description="Change the interface style without changing its colors."
    >
      <StyleTableGrid
        selectedThemeStyle={selectedThemeStyle}
        disabled={disabled}
        onSelect={onSelect}
      />
    </LayerBlock>
  );
}

interface StyleTableGridProps {
  selectedThemeStyle: ThemeStyleValue;
  disabled: boolean;
  onSelect: (value: ThemeStyleValue) => void;
}

function StyleTableGrid({
  selectedThemeStyle,
  disabled,
  onSelect,
}: StyleTableGridProps) {
  const lastRowStartIndex = getLastGridRowStartIndex(STYLE_OPTIONS.length);

  return (
    <div className="mt-4 grid md:grid-cols-2 md:gap-x-0">
      {STYLE_OPTIONS.map((option, index) => (
        <StyleOptionRow
          key={option.value}
          label={option.label}
          description={option.description}
          icon={option.icon}
          status={{
            selected: selectedThemeStyle === option.value,
            isDefault: option.value === DEFAULT_THEME_STYLE,
            disabled,
          }}
          boundaryState={{
            isFirstColumnOnDesktop: index % 2 === 0,
            isLastInGroup: index === STYLE_OPTIONS.length - 1,
            isLastRowOnDesktop: index >= lastRowStartIndex,
          }}
          onClick={() => onSelect(option.value)}
        />
      ))}
    </div>
  );
}
