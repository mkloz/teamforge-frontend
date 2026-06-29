import { Check, type LucideIcon, Palette, RotateCcw } from "lucide-react";
import { type ReactNode, useEffect } from "react";

import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
  SectionHeading,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { SegmentedTabs } from "@/shared/components/ui/segmented-tabs";
import {
  DEFAULT_THEME_APPEARANCE,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_STYLE,
  type ThemeAppearance as ThemeAppearanceValue,
  type ThemeColor as ThemeColorValue,
  type ThemeStyle as ThemeStyleValue,
} from "@/shared/constants/theme-preferences";
import { cn } from "@/shared/lib/utils";
import type { NotificationPreferences } from "@/shared/schemas";
import { useTheme } from "@/shared/store/theme.store";

interface AppearanceSettingsSectionProps {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  isOnline: boolean;
  onChange: (
    values: Pick<
      NotificationPreferences,
      "themeAppearance" | "themeStyle" | "themeColor"
    >,
  ) => Promise<void>;
}

import {
  APPEARANCE_OPTION_BY_ID,
  APPEARANCE_OPTIONS,
  COLOR_OPTION_BY_VALUE,
  COLOR_OPTIONS,
  type ColorOption,
  DEFAULT_THEME_PREFERENCES,
  GRID_OPTION_BOUNDARY_CLASS_RULES,
  type GridOptionBoundaryState,
  STYLE_OPTION_BY_VALUE,
  STYLE_OPTIONS,
  type ThemeOptionStatus,
  type ThemePreferenceKey,
  type ThemePreferenceValues,
  type ThemeSavingState,
  type ThemeSelectionState,
} from "./appearance-options";

export function AppearanceSettingsSection({
  notificationPreferences,
  isLoadingNotificationPreferences,
  isSavingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  isOnline,
  onChange,
}: AppearanceSettingsSectionProps) {
  const { appearance, themeStyle, themeColor, isDark, setThemePreferences } =
    useTheme();
  const selection = getThemeSelectionState(notificationPreferences, {
    themeAppearance: appearance,
    themeStyle,
    themeColor,
  });
  const savingState = getThemeSavingState(
    isSavingNotificationPreferences,
    savingNotificationPreferenceKeys,
  );
  const isDisabled = getAppearanceControlsDisabled({
    isLoadingNotificationPreferences,
    isOnline,
    notificationPreferences,
  });
  const isResetDisabled = getResetDisabledState({
    isDefaultTheme: selection.isDefaultTheme,
    isDisabled,
    ...savingState,
  });

  useEffect(() => {
    if (!notificationPreferences) {
      return;
    }

    setThemePreferences({
      themeAppearance: notificationPreferences.themeAppearance,
      themeStyle: notificationPreferences.themeStyle,
      themeColor: notificationPreferences.themeColor,
    });
  }, [notificationPreferences, setThemePreferences]);

  function saveThemePreference(values: ThemePreferenceValues) {
    if (!notificationPreferences || isDisabled) {
      return;
    }

    setThemePreferences(values);
    void onChange(values);
  }

  function saveThemePreferencePatch(values: Partial<ThemePreferenceValues>) {
    saveThemePreference({
      themeAppearance: selection.themeAppearance,
      themeStyle: selection.themeStyle,
      themeColor: selection.themeColor,
      ...values,
    });
  }

  return (
    <section className="flex max-w-4xl flex-col gap-7">
      <AppearanceSectionHeader
        isResetDisabled={isResetDisabled}
        isResetLoading={getResetLoadingState({
          isDefaultTheme: selection.isDefaultTheme,
          ...savingState,
        })}
        onReset={() => {
          saveThemePreference(DEFAULT_THEME_PREFERENCES);
        }}
      />

      <PreferenceStatusMessage error={error} />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing appearance settings." />
      ) : null}

      <ThemeRecipeStrip
        appearanceLabel={selection.selectedAppearanceOption.label}
        appearanceIcon={selection.selectedAppearanceOption.icon}
        styleLabel={selection.selectedStyleOption.label}
        styleIcon={selection.selectedStyleOption.icon}
        colorLabel={selection.selectedColorOption.label}
        colorSwatches={getThemeColorSwatches(
          selection.selectedColorOption,
          isDark,
        )}
      />

      <div className="flex flex-col gap-8 border-border border-t pt-6">
        <ModeLayer
          selectedAppearance={selection.themeAppearance}
          disabled={isDisabled || savingState.isSavingAppearance}
          onSelect={(nextAppearance) => {
            saveThemePreferencePatch({ themeAppearance: nextAppearance });
          }}
        />

        <StyleLayer
          selectedThemeStyle={selection.themeStyle}
          disabled={isDisabled || savingState.isSavingStyle}
          onSelect={(nextThemeStyle) => {
            saveThemePreferencePatch({ themeStyle: nextThemeStyle });
          }}
        />

        <ColorLayer
          isDark={isDark}
          selectedThemeColor={selection.themeColor}
          disabled={isDisabled || savingState.isSavingColor}
          onSelect={(nextThemeColor) => {
            saveThemePreferencePatch({ themeColor: nextThemeColor });
          }}
        />
      </div>
    </section>
  );
}

function getThemeSelectionState(
  notificationPreferences: NotificationPreferences | null,
  fallback: ThemePreferenceValues,
): ThemeSelectionState {
  const selectedValues = getSelectedThemeValues(
    notificationPreferences,
    fallback,
  );

  return {
    ...selectedValues,
    selectedAppearanceOption: getSelectedAppearanceOption(
      selectedValues.themeAppearance,
    ),
    selectedStyleOption: getSelectedStyleOption(selectedValues.themeStyle),
    selectedColorOption: getSelectedColorOption(selectedValues.themeColor),
    isDefaultTheme: getIsDefaultTheme(selectedValues),
  };
}

function getSelectedThemeValues(
  notificationPreferences: NotificationPreferences | null,
  fallback: ThemePreferenceValues,
): ThemePreferenceValues {
  return {
    themeAppearance: getThemePreferenceValue(
      notificationPreferences,
      fallback,
      "themeAppearance",
    ),
    themeStyle: getThemePreferenceValue(
      notificationPreferences,
      fallback,
      "themeStyle",
    ),
    themeColor: getThemePreferenceValue(
      notificationPreferences,
      fallback,
      "themeColor",
    ),
  };
}

function getThemePreferenceValue<Key extends ThemePreferenceKey>(
  notificationPreferences: NotificationPreferences | null,
  fallback: ThemePreferenceValues,
  key: Key,
) {
  return notificationPreferences?.[key] ?? fallback[key];
}

function getSelectedAppearanceOption(themeAppearance: ThemeAppearanceValue) {
  return APPEARANCE_OPTION_BY_ID.get(themeAppearance) ?? APPEARANCE_OPTIONS[0];
}

function getSelectedStyleOption(themeStyle: ThemeStyleValue) {
  return STYLE_OPTION_BY_VALUE.get(themeStyle) ?? STYLE_OPTIONS[0];
}

function getSelectedColorOption(themeColor: ThemeColorValue) {
  return COLOR_OPTION_BY_VALUE.get(themeColor) ?? COLOR_OPTIONS[0];
}

function getIsDefaultTheme({
  themeAppearance,
  themeColor,
  themeStyle,
}: ThemePreferenceValues) {
  return (
    themeAppearance === DEFAULT_THEME_APPEARANCE &&
    themeStyle === DEFAULT_THEME_STYLE &&
    themeColor === DEFAULT_THEME_COLOR
  );
}

function getThemeSavingState(
  isSavingNotificationPreferences: boolean,
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>,
): ThemeSavingState {
  return {
    isSavingAppearance:
      isSavingNotificationPreferences ||
      savingNotificationPreferenceKeys.has("themeAppearance"),
    isSavingStyle:
      isSavingNotificationPreferences ||
      savingNotificationPreferenceKeys.has("themeStyle"),
    isSavingColor:
      isSavingNotificationPreferences ||
      savingNotificationPreferenceKeys.has("themeColor"),
  };
}

function getAppearanceControlsDisabled({
  isLoadingNotificationPreferences,
  isOnline,
  notificationPreferences,
}: Pick<
  AppearanceSettingsSectionProps,
  "isLoadingNotificationPreferences" | "isOnline" | "notificationPreferences"
>) {
  return (
    !isOnline || isLoadingNotificationPreferences || !notificationPreferences
  );
}

function getResetDisabledState({
  isDefaultTheme,
  isDisabled,
  isSavingAppearance,
  isSavingStyle,
  isSavingColor,
}: ThemeSavingState & { isDefaultTheme: boolean; isDisabled: boolean }) {
  return [
    isDisabled,
    isSavingAppearance,
    isSavingStyle,
    isSavingColor,
    isDefaultTheme,
  ].some(Boolean);
}

function getResetLoadingState({
  isDefaultTheme,
  isSavingAppearance,
  isSavingStyle,
  isSavingColor,
}: ThemeSavingState & { isDefaultTheme: boolean }) {
  return (
    !isDefaultTheme && (isSavingAppearance || isSavingStyle || isSavingColor)
  );
}

interface AppearanceSectionHeaderProps {
  isResetDisabled: boolean;
  isResetLoading: boolean;
  onReset: () => void;
}

function AppearanceSectionHeader({
  isResetDisabled,
  isResetLoading,
  onReset,
}: AppearanceSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <SectionHeading
        title="Appearance"
        description="Layer the mode, material style, and color pack that make TeamForge feel right for you."
      />
      <Button
        type="button"
        variant="subtle"
        size="xs"
        className="self-start"
        disabled={isResetDisabled}
        loading={isResetLoading}
        onClick={onReset}
      >
        <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
        Reset defaults
      </Button>
    </div>
  );
}

interface ModeLayerProps {
  selectedAppearance: ThemeAppearanceValue;
  disabled: boolean;
  onSelect: (value: ThemeAppearanceValue) => void;
}

function ModeLayer({ selectedAppearance, disabled, onSelect }: ModeLayerProps) {
  return (
    <LayerBlock
      index="01"
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

interface StyleLayerProps {
  selectedThemeStyle: ThemeStyleValue;
  disabled: boolean;
  onSelect: (value: ThemeStyleValue) => void;
}

function StyleLayer({
  selectedThemeStyle,
  disabled,
  onSelect,
}: StyleLayerProps) {
  return (
    <LayerBlock
      index="02"
      title="Art style"
      description="Change the material without changing color."
    >
      <StyleTableGrid
        selectedThemeStyle={selectedThemeStyle}
        disabled={disabled}
        onSelect={onSelect}
      />
    </LayerBlock>
  );
}

interface ColorLayerProps {
  isDark: boolean;
  selectedThemeColor: ThemeColorValue;
  disabled: boolean;
  onSelect: (value: ThemeColorValue) => void;
}

function ColorLayer({
  isDark,
  selectedThemeColor,
  disabled,
  onSelect,
}: ColorLayerProps) {
  return (
    <LayerBlock
      index="03"
      title="Color"
      description="Choose a familiar base or a sharper direction."
    >
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

interface ThemeRecipeStripProps {
  appearanceLabel: string;
  appearanceIcon: LucideIcon;
  styleLabel: string;
  styleIcon: LucideIcon;
  colorLabel: string;
  colorSwatches: readonly string[];
}

function ThemeRecipeStrip({
  appearanceLabel,
  appearanceIcon: AppearanceIcon,
  styleLabel,
  styleIcon: StyleIcon,
  colorLabel,
  colorSwatches,
}: ThemeRecipeStripProps) {
  return (
    <div className="border-border border-y">
      <div className="grid divide-y divide-border md:grid-cols-[1fr_1fr_1.15fr] md:divide-x md:divide-y-0">
        <RecipeItem
          icon={AppearanceIcon}
          eyebrow="Mode"
          label={appearanceLabel}
        />
        <RecipeItem icon={StyleIcon} eyebrow="Style" label={styleLabel} />
        <div className="flex min-w-0 items-center gap-3 py-3 md:px-5">
          <IconTile
            icon={Palette}
            tone="neutral"
            size="lg"
            className="size-9 bg-input text-slate-muted"
            iconClassName="size-4"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-muted text-xs">Color</p>
            <div className="mt-1 flex min-w-0 items-center gap-3">
              <p className="truncate font-black text-ink text-sm">
                {colorLabel}
              </p>
              <SwatchStrip swatches={colorSwatches} className="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecipeItemProps {
  icon: LucideIcon;
  eyebrow: string;
  label: string;
}

function RecipeItem({ icon: Icon, eyebrow, label }: RecipeItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-3 md:px-5 first:md:pl-0">
      <IconTile
        icon={Icon}
        tone="neutral"
        size="lg"
        className="size-9 bg-input text-slate-muted"
        iconClassName="size-4"
      />
      <div className="min-w-0">
        <p className="font-semibold text-slate-muted text-xs">{eyebrow}</p>
        <p className="mt-1 truncate font-black text-ink text-sm">{label}</p>
      </div>
    </div>
  );
}

interface LayerBlockProps {
  children: ReactNode;
  description: string;
  index: string;
  title: string;
}

function LayerBlock({ children, description, index, title }: LayerBlockProps) {
  return (
    <section className="min-w-0">
      <div className="flex items-start gap-3">
        <p className="mt-1 w-6 shrink-0 font-black text-primary text-xs">
          {index}
        </p>
        <div className="min-w-0">
          <h3 className="font-black text-base text-ink">{title}</h3>
          <p className="mt-1 text-pretty text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PreferenceMarkers({
  isDefault,
  selected,
}: {
  isDefault: boolean;
  selected: boolean;
}) {
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

interface StyleOptionRowProps {
  label: string;
  description: string;
  icon: LucideIcon;
  status: ThemeOptionStatus;
  boundaryState: GridOptionBoundaryState;
  onClick: () => void;
}

function StyleOptionRow({
  label,
  description,
  icon: Icon,
  status,
  boundaryState,
  onClick,
}: StyleOptionRowProps) {
  const optionClassName = getStyleOptionRowClassName({
    ...boundaryState,
    disabled: status.disabled,
    selected: status.selected,
  });
  const iconClassName = getStyleOptionIconClassName(status.selected);

  return (
    <button
      type="button"
      aria-pressed={status.selected}
      disabled={status.disabled}
      onClick={onClick}
      className={optionClassName}
    >
      <IconTile
        icon={Icon}
        tone={status.selected ? "teal" : "neutral"}
        size="lg"
        bordered
        className={iconClassName}
        iconClassName="size-4"
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-black text-inherit text-sm">
              {label}
            </span>
            <PreferenceMarkers isDefault={status.isDefault} selected={false} />
          </span>
          {status.selected ? (
            <Check
              className="size-4 shrink-0 text-primary"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          ) : null}
        </span>
        <span className="mt-1 block truncate text-slate-muted text-xs leading-relaxed">
          {description}
        </span>
      </span>
    </button>
  );
}

function getStyleOptionRowClassName({
  disabled,
  selected,
  ...boundaryState
}: GridOptionBoundaryState & { disabled: boolean; selected: boolean }) {
  return cn(
    "group flex w-full items-center gap-3 border-border border-b px-2 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:transition-none",
    selected ? "text-ink" : "text-slate-muted hover:bg-muted/35 hover:text-ink",
    ...getGridOptionBoundaryClassNames(boundaryState),
    disabled && "cursor-not-allowed opacity-65",
  );
}

function getStyleOptionIconClassName(selected: boolean) {
  return cn(
    "transition-colors duration-150",
    selected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-input text-slate-muted group-hover:text-ink",
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

function getThemeColorSwatches(option: ColorOption, isDark: boolean) {
  return option.swatches[isDark ? "dark" : "light"];
}

function getLastGridRowStartIndex(optionCount: number) {
  return optionCount - (optionCount % 2 === 0 ? 2 : 1);
}

interface ColorOptionRowProps {
  label: string;
  description: string;
  swatches: readonly string[];
  status: ThemeOptionStatus;
  boundaryState: GridOptionBoundaryState;
  onClick: () => void;
}

function ColorOptionRow({
  label,
  description,
  swatches,
  status,
  boundaryState,
  onClick,
}: ColorOptionRowProps) {
  const optionClassName = getColorOptionRowClassName({
    ...boundaryState,
    disabled: status.disabled,
    selected: status.selected,
  });

  return (
    <button
      type="button"
      aria-pressed={status.selected}
      disabled={status.disabled}
      onClick={onClick}
      className={optionClassName}
    >
      <SwatchStrip swatches={swatches} className="h-11 w-full" />

      <span className="min-w-0">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-black text-ink text-sm">{label}</span>
          <PreferenceMarkers
            isDefault={status.isDefault}
            selected={status.selected}
          />
        </span>
        <span className="mt-0.5 block truncate text-slate-muted text-xs leading-relaxed">
          {description}
        </span>
      </span>

      <ColorSelectionMark selected={status.selected} />
    </button>
  );
}

function getColorOptionRowClassName({
  disabled,
  selected,
  ...boundaryState
}: GridOptionBoundaryState & { disabled: boolean; selected: boolean }) {
  return cn(
    "group grid min-h-16 w-full grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-4 border-border border-b px-2 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:transition-none",
    selected ? "text-ink" : "hover:bg-muted/35",
    ...getGridOptionBoundaryClassNames(boundaryState),
    disabled && "cursor-not-allowed opacity-65",
  );
}

function ColorSelectionMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-transparent bg-transparent text-transparent group-hover:border-border group-hover:bg-input group-hover:text-slate-muted",
      )}
    >
      {selected ? (
        <Check size={11} strokeWidth={3} aria-hidden="true" />
      ) : (
        <span className="size-1.5 rounded-full bg-current" />
      )}
    </span>
  );
}

function getGridOptionBoundaryClassNames({
  isFirstColumnOnDesktop,
  isLastInGroup,
  isLastRowOnDesktop,
}: GridOptionBoundaryState) {
  const boundaryState = {
    isFirstColumnOnDesktop,
    isLastInGroup,
    isLastRowOnDesktop,
  };

  return GRID_OPTION_BOUNDARY_CLASS_RULES.map(
    (rule) => rule.isActive(boundaryState) && rule.className,
  );
}

interface SwatchStripProps {
  swatches: readonly string[];
  className?: string;
}

function SwatchStrip({ swatches, className }: SwatchStripProps) {
  return (
    <span
      className={cn(
        "flex overflow-hidden rounded-lg border border-border bg-input",
        className,
      )}
    >
      {swatches.map((swatch) => (
        <span
          key={swatch}
          className={cn("min-w-0 flex-1", swatch)}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
