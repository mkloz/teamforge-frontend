import { Check } from "lucide-react";

import {
  DEFAULT_THEME_COLOR,
  type ThemeColor,
} from "@/shared/constants/theme-preferences";
import { cn } from "@/shared/lib/utils";

import { COLOR_OPTIONS, type ColorOption } from "./appearance-options";

interface AppearanceColorPickerProps {
  disabled: boolean;
  isDark: boolean;
  onSelect: (value: ThemeColor) => void;
  selectedColor: ThemeColor;
}

export function AppearanceColorPicker({
  disabled,
  isDark,
  onSelect,
  selectedColor,
}: AppearanceColorPickerProps) {
  const groups = getColorGroups(COLOR_OPTIONS);

  return (
    <section className="rounded-2xl bg-card p-3 sm:p-5">
      <div>
        <h3 className="font-bold text-base text-ink">Palette</h3>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          Pick the surface and accent combination used across TeamForge.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:gap-6">
        {groups.map((group) => (
          <section key={group.label} aria-labelledby={group.id}>
            <div className="flex items-baseline justify-between gap-3">
              <h4 id={group.id} className="font-bold text-ink text-sm">
                {group.label}
              </h4>
              <span className="text-slate-muted text-xs">
                {group.description}
              </span>
            </div>

            <fieldset
              aria-labelledby={group.id}
              className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {group.options.map((option) => (
                <PaletteOption
                  key={option.value}
                  disabled={disabled}
                  isDark={isDark}
                  isSelected={selectedColor === option.value}
                  option={option}
                  onSelect={onSelect}
                />
              ))}
            </fieldset>
          </section>
        ))}
      </div>
    </section>
  );
}

function PaletteOption({
  disabled,
  isDark,
  isSelected,
  onSelect,
  option,
}: {
  disabled: boolean;
  isDark: boolean;
  isSelected: boolean;
  onSelect: (value: ThemeColor) => void;
  option: ColorOption;
}) {
  const swatches = option.swatches[isDark ? "dark" : "light"];

  return (
    <label
      className={cn(
        "group relative min-w-0 rounded-xl bg-background/55 p-2 text-left shadow-soft-sm transition-[background-color,box-shadow] duration-150 motion-reduce:transition-none sm:p-2.5",
        isSelected ? "bg-primary/10 shadow-soft-md" : "hover:shadow-soft-md",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <input
        type="radio"
        name="appearance-color"
        value={option.value}
        checked={isSelected}
        disabled={disabled}
        onChange={() => onSelect(option.value)}
        className="absolute inset-0 size-full cursor-pointer appearance-none rounded-xl outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
      />
      <span className="flex h-7 overflow-hidden rounded-lg">
        {swatches.map((swatch) => (
          <span
            key={swatch}
            className={cn("min-w-0 flex-1", swatch)}
            aria-hidden="true"
          />
        ))}
      </span>

      <span className="mt-2 flex min-w-0 items-center gap-1.5">
        <span className="truncate font-bold text-ink text-sm">
          {option.label}
        </span>
        {option.value === DEFAULT_THEME_COLOR ? (
          <span className="shrink-0 text-slate-muted text-xs">Default</span>
        ) : null}
      </span>
      <span className="mt-0.5 block truncate text-slate-muted text-xs">
        {option.description}
      </span>

      {isSelected ? (
        <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Check className="size-3" strokeWidth={3} aria-hidden="true" />
        </span>
      ) : null}
    </label>
  );
}

function getColorGroups(options: readonly ColorOption[]) {
  return [
    {
      id: "appearance-core-palettes",
      label: "Core palettes",
      description: "Balanced",
      options: options.filter((option) => option.tag === "Core"),
    },
    {
      id: "appearance-experimental-palettes",
      label: "Specialized",
      description: "Focused needs",
      options: options.filter((option) => option.tag === "Specialized"),
    },
  ] as const;
}
