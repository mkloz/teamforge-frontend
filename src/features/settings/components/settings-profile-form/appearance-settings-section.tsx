import {
  Brush,
  Check,
  Frame,
  Layers2,
  type LucideIcon,
  Monitor,
  Moon,
  Palette,
  PenLine,
  RotateCcw,
  Sun,
} from "lucide-react";
import { type ReactNode, useEffect } from "react";

import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
  SectionHeading,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import {
  type SegmentedTabOption,
  SegmentedTabs,
} from "@/shared/components/ui/segmented-tabs";
import {
  DEFAULT_THEME_APPEARANCE,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_STYLE,
  ThemeAppearance,
  type ThemeAppearance as ThemeAppearanceValue,
  ThemeColor,
  type ThemeColor as ThemeColorValue,
  ThemeStyle,
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

const APPEARANCE_OPTIONS = [
  {
    id: ThemeAppearance.SYSTEM,
    label: "System",
    shortLabel: "Auto",
    icon: Monitor,
  },
  {
    id: ThemeAppearance.LIGHT,
    label: "Light",
    icon: Sun,
  },
  {
    id: ThemeAppearance.DARK,
    label: "Dark",
    icon: Moon,
  },
] as const satisfies ReadonlyArray<SegmentedTabOption<ThemeAppearanceValue>>;

const STYLE_OPTIONS = [
  {
    value: ThemeStyle.CLASSIC,
    label: "Classic",
    description: "Default material.",
    icon: Layers2,
  },
  {
    value: ThemeStyle.GLASS,
    label: "Glass",
    description: "Soft translucent panels.",
    icon: Brush,
  },
  {
    value: ThemeStyle.INK,
    label: "Ink",
    description: "Denser, tighter surfaces.",
    icon: PenLine,
  },
  {
    value: ThemeStyle.POSTER,
    label: "Poster",
    description: "Bolder graphic borders.",
    icon: Frame,
  },
] as const;

const COLOR_OPTIONS = [
  {
    value: ThemeColor.GRAPHITE,
    label: "Graphite",
    description: "Dense neutral default.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#F2F2EF]",
        "bg-[#F9F9F4]",
        "bg-[#E9E9E3]",
        "bg-[#0F766E]",
        "bg-[#D98F00]",
      ],
      dark: [
        "bg-[#070908]",
        "bg-[#0E1110]",
        "bg-[#202522]",
        "bg-[#12A096]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.FORGE,
    label: "Ash",
    description: "Soft neutral surface.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#F3F3F0]",
        "bg-[#FAFAF5]",
        "bg-[#E7E9E4]",
        "bg-[#0F766E]",
        "bg-[#E49A00]",
      ],
      dark: [
        "bg-[#090B0A]",
        "bg-[#111412]",
        "bg-[#222722]",
        "bg-[#12A096]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.HARBOR,
    label: "Steel",
    description: "Cool graphite focus.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#EDF1F2]",
        "bg-[#F7FAF9]",
        "bg-[#E4EAEA]",
        "bg-[#0E7F76]",
        "bg-[#E99900]",
      ],
      dark: [
        "bg-[#071011]",
        "bg-[#0E1718]",
        "bg-[#1D2B2C]",
        "bg-[#14A397]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.EMBER,
    label: "Copper",
    description: "Warm graphite energy.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#F4F1ED]",
        "bg-[#FAF7F1]",
        "bg-[#ECE7DF]",
        "bg-[#0F766E]",
        "bg-[#E89400]",
      ],
      dark: [
        "bg-[#100E0B]",
        "bg-[#181512]",
        "bg-[#2A251F]",
        "bg-[#14A394]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.SPRUCE,
    label: "Sage",
    description: "Muted green-neutral.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#EEF3ED]",
        "bg-[#F7FAF4]",
        "bg-[#E6EDE4]",
        "bg-[#0E7A68]",
        "bg-[#DC9400]",
      ],
      dark: [
        "bg-[#0A100C]",
        "bg-[#101813]",
        "bg-[#222B22]",
        "bg-[#18A27F]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.PAPER,
    label: "Chalk",
    description: "Clean bright neutral.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#F7F7F2]",
        "bg-[#FCFCF7]",
        "bg-[#ECEEE8]",
        "bg-[#0F766E]",
        "bg-[#E99900]",
      ],
      dark: [
        "bg-[#101110]",
        "bg-[#171A17]",
        "bg-[#292D28]",
        "bg-[#14A194]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.ULTRAVIOLET,
    label: "Ultraviolet",
    description: "Violet with aqua contrast.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#F4F0FA]",
        "bg-[#FAF7FF]",
        "bg-[#ECE6F6]",
        "bg-[#6D3FD9]",
        "bg-[#009F95]",
      ],
      dark: [
        "bg-[#0E0A16]",
        "bg-[#15101F]",
        "bg-[#2B223A]",
        "bg-[#A78BFA]",
        "bg-[#2DD4BF]",
      ],
    },
  },
  {
    value: ThemeColor.COBALT,
    label: "Cobalt",
    description: "Blue with orange heat.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#EEF3FB]",
        "bg-[#F7FAFF]",
        "bg-[#E4ECF7]",
        "bg-[#2563EB]",
        "bg-[#EA580C]",
      ],
      dark: [
        "bg-[#07111F]",
        "bg-[#0D1A2C]",
        "bg-[#1E304A]",
        "bg-[#60A5FA]",
        "bg-[#FB923C]",
      ],
    },
  },
  {
    value: ThemeColor.CORAL,
    label: "Coral",
    description: "Warm with mint lift.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#FFF1EE]",
        "bg-[#FFF8F5]",
        "bg-[#F4E2DC]",
        "bg-[#C2410C]",
        "bg-[#0F9488]",
      ],
      dark: [
        "bg-[#160D0B]",
        "bg-[#201311]",
        "bg-[#34231F]",
        "bg-[#FB7185]",
        "bg-[#2DD4BF]",
      ],
    },
  },
  {
    value: ThemeColor.ACID,
    label: "Acid",
    description: "Vivid lime oddity.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#F5F9E8]",
        "bg-[#FCFFF1]",
        "bg-[#EAF2C8]",
        "bg-[#4D7C0F]",
        "bg-[#7C3AED]",
      ],
      dark: [
        "bg-[#0E1206]",
        "bg-[#151B0B]",
        "bg-[#2A3318]",
        "bg-[#A3E635]",
        "bg-[#C084FC]",
      ],
    },
  },
  {
    value: ThemeColor.MONO,
    label: "Mono",
    description: "Near-colorless focus.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#F4F4F2]",
        "bg-[#FAFAF7]",
        "bg-[#E9E9E6]",
        "bg-[#262626]",
        "bg-[#52525B]",
      ],
      dark: [
        "bg-[#050505]",
        "bg-[#101010]",
        "bg-[#262626]",
        "bg-[#E5E5E5]",
        "bg-[#A3A3A3]",
      ],
    },
  },
] as const;

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
  const selectedAppearance =
    notificationPreferences?.themeAppearance ?? appearance;
  const selectedThemeStyle = notificationPreferences?.themeStyle ?? themeStyle;
  const selectedThemeColor = notificationPreferences?.themeColor ?? themeColor;
  const isDisabled =
    !isOnline || isLoadingNotificationPreferences || !notificationPreferences;
  const isSavingAppearance =
    isSavingNotificationPreferences ||
    savingNotificationPreferenceKeys.has("themeAppearance");
  const isSavingStyle =
    isSavingNotificationPreferences ||
    savingNotificationPreferenceKeys.has("themeStyle");
  const isSavingColor =
    isSavingNotificationPreferences ||
    savingNotificationPreferenceKeys.has("themeColor");

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

  function saveThemePreference(values: {
    themeAppearance: ThemeAppearanceValue;
    themeStyle: ThemeStyleValue;
    themeColor: ThemeColorValue;
  }) {
    if (!notificationPreferences || isDisabled) {
      return;
    }

    setThemePreferences(values);
    void onChange(values);
  }

  const selectedAppearanceOption =
    APPEARANCE_OPTIONS.find((option) => option.id === selectedAppearance) ??
    APPEARANCE_OPTIONS[0];
  const selectedStyleOption =
    STYLE_OPTIONS.find((option) => option.value === selectedThemeStyle) ??
    STYLE_OPTIONS[0];
  const selectedColorOption =
    COLOR_OPTIONS.find((option) => option.value === selectedThemeColor) ??
    COLOR_OPTIONS[0];
  const isDefaultTheme =
    selectedAppearance === DEFAULT_THEME_APPEARANCE &&
    selectedThemeStyle === DEFAULT_THEME_STYLE &&
    selectedThemeColor === DEFAULT_THEME_COLOR;
  const isResetDisabled =
    isDisabled ||
    isSavingAppearance ||
    isSavingStyle ||
    isSavingColor ||
    isDefaultTheme;

  return (
    <section className="flex max-w-4xl flex-col gap-7">
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
          loading={
            !isDefaultTheme &&
            (isSavingAppearance || isSavingStyle || isSavingColor)
          }
          onClick={() => {
            saveThemePreference({
              themeAppearance: DEFAULT_THEME_APPEARANCE,
              themeStyle: DEFAULT_THEME_STYLE,
              themeColor: DEFAULT_THEME_COLOR,
            });
          }}
        >
          <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
          Reset defaults
        </Button>
      </div>

      <PreferenceStatusMessage error={error} />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing appearance settings." />
      ) : null}

      <ThemeRecipeStrip
        appearanceLabel={selectedAppearanceOption.label}
        appearanceIcon={selectedAppearanceOption.icon}
        styleLabel={selectedStyleOption.label}
        styleIcon={selectedStyleOption.icon}
        colorLabel={selectedColorOption.label}
        colorSwatches={selectedColorOption.swatches[isDark ? "dark" : "light"]}
      />

      <div className="flex flex-col gap-8 border-border border-t pt-6">
        <LayerBlock
          index="01"
          title="Mode"
          description="Follow your device, or pin one mode for this account."
        >
          <SegmentedTabs
            ariaLabel="Appearance mode"
            className="mt-4 w-full max-w-96"
            disabled={isDisabled || isSavingAppearance}
            fill
            options={APPEARANCE_OPTIONS}
            size="sm"
            value={selectedAppearance}
            onChange={(nextAppearance) => {
              saveThemePreference({
                themeAppearance: nextAppearance,
                themeStyle: selectedThemeStyle,
                themeColor: selectedThemeColor,
              });
            }}
          />
        </LayerBlock>

        <LayerBlock
          index="02"
          title="Art style"
          description="Change the material without changing color."
        >
          <StyleTableGrid
            selectedThemeStyle={selectedThemeStyle}
            disabled={isDisabled || isSavingStyle}
            onSelect={(nextThemeStyle) => {
              saveThemePreference({
                themeAppearance: selectedAppearance,
                themeStyle: nextThemeStyle,
                themeColor: selectedThemeColor,
              });
            }}
          />
        </LayerBlock>

        <LayerBlock
          index="03"
          title="Color"
          description="Choose a familiar base or a sharper direction."
        >
          <ColorTableGrid
            options={COLOR_OPTIONS}
            isDark={isDark}
            selectedThemeColor={selectedThemeColor}
            disabled={isDisabled || isSavingColor}
            onSelect={(nextThemeColor) => {
              saveThemePreference({
                themeAppearance: selectedAppearance,
                themeStyle: selectedThemeStyle,
                themeColor: nextThemeColor,
              });
            }}
          />
        </LayerBlock>
      </div>
    </section>
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
    <div className="flex min-w-0 items-center gap-3 py-3 md:px-5 md:first:pl-0">
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
  return (
    <div className="mt-4 grid md:grid-cols-2 md:gap-x-0">
      {STYLE_OPTIONS.map((option, index) => {
        const lastRowStartIndex =
          STYLE_OPTIONS.length - (STYLE_OPTIONS.length % 2 === 0 ? 2 : 1);

        return (
          <StyleOptionRow
            key={option.value}
            label={option.label}
            description={option.description}
            icon={option.icon}
            selected={selectedThemeStyle === option.value}
            isDefault={option.value === DEFAULT_THEME_STYLE}
            disabled={disabled}
            isFirstColumnOnDesktop={index % 2 === 0}
            isLastInGroup={index === STYLE_OPTIONS.length - 1}
            isLastRowOnDesktop={index >= lastRowStartIndex}
            onClick={() => onSelect(option.value)}
          />
        );
      })}
    </div>
  );
}

interface StyleOptionRowProps {
  label: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  isDefault: boolean;
  disabled: boolean;
  isFirstColumnOnDesktop: boolean;
  isLastInGroup: boolean;
  isLastRowOnDesktop: boolean;
  onClick: () => void;
}

function StyleOptionRow({
  label,
  description,
  icon: Icon,
  selected,
  isDefault,
  disabled,
  isFirstColumnOnDesktop,
  isLastInGroup,
  isLastRowOnDesktop,
  onClick,
}: StyleOptionRowProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 border-border border-b px-2 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:transition-none",
        selected
          ? "text-ink"
          : "text-slate-muted hover:bg-muted/35 hover:text-ink",
        isFirstColumnOnDesktop && "md:border-r md:pr-5",
        !isFirstColumnOnDesktop && "md:pl-5",
        isLastInGroup && "border-b-0",
        isLastRowOnDesktop && "md:border-b-0",
        disabled && "cursor-not-allowed opacity-65",
      )}
    >
      <IconTile
        icon={Icon}
        tone={selected ? "teal" : "neutral"}
        size="lg"
        bordered
        className={cn(
          "transition-colors duration-150",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-input text-slate-muted group-hover:text-ink",
        )}
        iconClassName="size-4"
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-black text-inherit text-sm">
              {label}
            </span>
            <PreferenceMarkers isDefault={isDefault} selected={false} />
          </span>
          {selected ? (
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

interface ColorOption {
  value: ThemeColorValue;
  label: string;
  description: string;
  tag: string;
  swatches: {
    light: readonly string[];
    dark: readonly string[];
  };
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
  const groups = [
    {
      label: "Core",
      options: options.filter((option) => option.tag === "Core"),
    },
    {
      label: "Experimental",
      options: options.filter((option) => option.tag === "Experimental"),
    },
  ] as const;

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
              const lastRowStartIndex =
                group.options.length - (group.options.length % 2 === 0 ? 2 : 1);

              return (
                <ColorOptionRow
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  swatches={option.swatches[isDark ? "dark" : "light"]}
                  selected={selectedThemeColor === option.value}
                  isDefault={option.value === DEFAULT_THEME_COLOR}
                  disabled={disabled}
                  isFirstColumnOnDesktop={index % 2 === 0}
                  isLastInGroup={index === group.options.length - 1}
                  isLastRowOnDesktop={index >= lastRowStartIndex}
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

interface ColorOptionRowProps {
  label: string;
  description: string;
  swatches: readonly string[];
  selected: boolean;
  isDefault: boolean;
  disabled: boolean;
  isFirstColumnOnDesktop: boolean;
  isLastInGroup: boolean;
  isLastRowOnDesktop: boolean;
  onClick: () => void;
}

function ColorOptionRow({
  label,
  description,
  swatches,
  selected,
  isDefault,
  disabled,
  isFirstColumnOnDesktop,
  isLastInGroup,
  isLastRowOnDesktop,
  onClick,
}: ColorOptionRowProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group grid min-h-16 w-full grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-4 border-border border-b px-2 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:transition-none",
        selected ? "text-ink" : "hover:bg-muted/35",
        isFirstColumnOnDesktop && "md:border-r md:pr-5",
        !isFirstColumnOnDesktop && "md:pl-5",
        isLastInGroup && "border-b-0",
        isLastRowOnDesktop && "md:border-b-0",
        disabled && "cursor-not-allowed opacity-65",
      )}
    >
      <SwatchStrip swatches={swatches} className="h-11 w-full" />

      <span className="min-w-0">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-black text-ink text-sm">{label}</span>
          <PreferenceMarkers isDefault={isDefault} selected={selected} />
        </span>
        <span className="mt-0.5 block truncate text-slate-muted text-xs leading-relaxed">
          {description}
        </span>
      </span>

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
    </button>
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
