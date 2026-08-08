import { Check } from "lucide-react";

import {
  DEFAULT_THEME_STYLE,
  ThemeStyle,
  type ThemeStyle as ThemeStyleValue,
} from "@/shared/constants/theme-preferences";
import { cn } from "@/shared/lib/utils";

import { STYLE_OPTIONS } from "./appearance-options";

interface AppearanceStylePickerProps {
  disabled: boolean;
  onSelect: (value: ThemeStyleValue) => void;
  selectedStyle: ThemeStyleValue;
}

export function AppearanceStylePicker({
  disabled,
  onSelect,
  selectedStyle,
}: AppearanceStylePickerProps) {
  return (
    <section className="rounded-2xl bg-card p-3 sm:p-5">
      <div>
        <h3 className="font-bold text-base text-ink">Interface style</h3>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          Choose compact controls, stronger contrast, or fewer visual effects.
        </p>
      </div>

      <fieldset
        aria-label="Interface style"
        className="mt-4 grid gap-2 sm:grid-cols-2"
      >
        {STYLE_OPTIONS.map((option) => {
          const isSelected = selectedStyle === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                "group relative min-w-0 rounded-[13px] bg-background/55 p-2 text-left shadow-soft-sm transition-[background-color,box-shadow] duration-150 motion-reduce:transition-none sm:p-3",
                isSelected
                  ? "bg-primary/10 shadow-soft-md"
                  : "hover:shadow-soft-md",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              )}
            >
              <input
                type="radio"
                name="appearance-style"
                value={option.value}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onSelect(option.value)}
                className="absolute inset-0 z-10 size-full cursor-pointer appearance-none rounded-[13px] outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
              />
              <StyleSpecimen style={option.value} selected={isSelected} />

              <span className="mt-3 flex min-w-0 items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">
                      {option.label}
                    </span>
                    {option.value === DEFAULT_THEME_STYLE ? (
                      <span className="text-slate-muted text-xs">Default</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-slate-muted text-xs leading-relaxed">
                    {option.description}
                  </span>
                </span>
                {isSelected ? (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check
                      className="size-3"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
}

function StyleSpecimen({
  selected,
  style,
}: {
  selected: boolean;
  style: ThemeStyleValue;
}) {
  return (
    <span
      aria-hidden="true"
      data-appearance-specimen={style}
      className={cn(
        "relative block h-18 overflow-hidden bg-canvas p-2.5",
        getSpecimenFrameClassName(style),
        selected && "bg-primary/6",
      )}
    >
      {style === ThemeStyle.CLASSIC ? <ClassicSpecimen /> : null}
      {style === ThemeStyle.GLASS ? <ReducedEffectsSpecimen /> : null}
      {style === ThemeStyle.INK ? <InkSpecimen /> : null}
      {style === ThemeStyle.POSTER ? <PosterSpecimen /> : null}
    </span>
  );
}

function ClassicSpecimen() {
  return (
    <span className="grid h-full grid-cols-[1fr_0.7fr] gap-2">
      <span className="rounded-[10px] bg-card p-2 shadow-sm">
        <span className="block h-2 w-2/3 rounded-full bg-ink/70" />
        <span className="mt-2 block h-1.5 w-full rounded-full bg-muted" />
        <span className="mt-1 block h-1.5 w-4/5 rounded-full bg-muted/75" />
      </span>
      <span className="rounded-[10px] bg-card p-2 shadow-sm">
        <span className="block size-4 rounded-full bg-primary/25" />
        <span className="mt-2 block h-1.5 w-full rounded-full bg-muted" />
      </span>
    </span>
  );
}

function ReducedEffectsSpecimen() {
  return (
    <span className="grid h-full grid-cols-2 gap-2">
      <span className="rounded-lg bg-surface-inset p-2">
        <span className="block h-2 w-3/4 rounded-full bg-ink/65" />
        <span className="mt-2 block h-1.5 w-full rounded-full bg-muted" />
      </span>
      <span className="rounded-lg bg-surface-inset p-2">
        <span className="block h-1.5 w-full rounded-full bg-muted" />
        <span className="mt-1 block h-1.5 w-2/3 rounded-full bg-muted" />
      </span>
    </span>
  );
}

function InkSpecimen() {
  return (
    <span className="grid h-full grid-cols-[0.55fr_1fr] gap-1.5">
      <span className="rounded-[6px] bg-muted/80 p-1.5">
        <span className="block h-full rounded-[3px] bg-primary/16" />
      </span>
      <span className="flex flex-col gap-1 rounded-[6px] bg-muted/80 p-2">
        <span className="h-1.5 w-4/5 rounded-full bg-ink/70" />
        <span className="h-1 w-full rounded-full bg-slate-muted/35" />
        <span className="h-1 w-5/6 rounded-full bg-slate-muted/25" />
        <span className="mt-auto h-3 w-1/2 rounded-[3px] bg-primary/22" />
      </span>
    </span>
  );
}

function PosterSpecimen() {
  return (
    <span className="grid h-full grid-cols-[1fr_0.7fr] gap-2">
      <span className="rounded-[3px] border-2 border-ink/65 bg-card p-2 shadow-[2px_2px_0_color-mix(in_srgb,var(--color-ink)_40%,transparent)]">
        <span className="block h-2 w-3/4 bg-ink/75" />
        <span className="mt-2 block h-1.5 w-full bg-muted" />
        <span className="mt-1 block h-1.5 w-2/3 bg-muted/75" />
      </span>
      <span className="rounded-[3px] border-2 border-primary/70 bg-primary/10 p-2">
        <span className="block h-full bg-primary/22" />
      </span>
    </span>
  );
}

function getSpecimenFrameClassName(style: ThemeStyleValue) {
  if (style === ThemeStyle.POSTER) {
    return "rounded-[6px]";
  }

  return style === ThemeStyle.INK ? "rounded-[10px]" : "rounded-[16px]";
}
