import {
  DEFAULT_THEME_COLOR,
  type ThemeColor as ThemeColorValue,
} from "@/shared/constants/theme-preferences";
import { COLOR_OPTIONS, type ColorOption } from "./appearance-options";
import { ColorOptionRow } from "./color-option-row";
import { getLastGridRowStartIndex } from "./grid-row-index";
import { LayerBlock } from "./layer-block";
import { getThemeColorSwatches } from "./theme-color-swatches";

interface ColorLayerProps {
  isDark: boolean;
  selectedThemeColor: ThemeColorValue;
  disabled: boolean;
  onSelect: (value: ThemeColorValue) => void;
}

export function ColorLayer({
  isDark,
  selectedThemeColor,
  disabled,
  onSelect,
}: ColorLayerProps) {
  return (
    <LayerBlock title="Color">
      <ColorTableGrid
        options={COLOR_OPTIONS}
        isDark={isDark}
        selectedThemeColor={selectedThemeColor}
        disabled={disabled}
        onSelect={onSelect}
      />
    </LayerBlock>
  );
}

interface ColorTableGridProps {
  options: readonly ColorOption[];
  isDark: boolean;
  selectedThemeColor: ThemeColorValue;
  disabled: boolean;
  onSelect: (value: ThemeColorValue) => void;
}

function ColorTableGrid({
  options,
  isDark,
  selectedThemeColor,
  disabled,
  onSelect,
}: ColorTableGridProps) {
  const groups = getColorOptionGroups(options);

  return (
    <div className="mt-4">
      {groups.map((group) => (
        <section
          key={group.label}
          className="min-w-0 border-border border-t first:border-t-0"
        >
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-border border-b px-2 py-2">
            <p className="font-black text-ink text-sm">{group.label}</p>
            <p className="font-semibold text-slate-muted text-xs">
              {group.options.length} colors
            </p>
          </div>
          <div className="grid md:grid-cols-2 md:gap-x-0">
            {group.options.map((option, index) => {
              const lastRowStartIndex = getLastGridRowStartIndex(
                group.options.length,
              );

              return (
                <ColorOptionRow
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  swatches={getThemeColorSwatches(option, isDark)}
                  status={{
                    selected: selectedThemeColor === option.value,
                    isDefault: option.value === DEFAULT_THEME_COLOR,
                    disabled,
                  }}
                  boundaryState={{
                    isFirstColumnOnDesktop: index % 2 === 0,
                    isLastInGroup: index === group.options.length - 1,
                    isLastRowOnDesktop: index >= lastRowStartIndex,
                  }}
                  onClick={() => onSelect(option.value)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function getColorOptionGroups(options: readonly ColorOption[]) {
  return [
    {
      label: "Core",
      options: options.filter((option) => option.tag === "Core"),
    },
    {
      label: "Experimental",
      options: options.filter((option) => option.tag === "Experimental"),
    },
  ] as const;
}
