import { Check } from "lucide-react";

import type { ThemeAppearance } from "@/shared/constants/theme-preferences";
import { cn } from "@/shared/lib/utils";

import { APPEARANCE_OPTIONS } from "./appearance-options";

const MODE_DESCRIPTIONS: Record<ThemeAppearance, string> = {
  system: "Match this device",
  light: "Always bright",
  dark: "Always low-glare",
};

interface AppearanceModePickerProps {
  disabled: boolean;
  onSelect: (value: ThemeAppearance) => void;
  selectedAppearance: ThemeAppearance;
}

export function AppearanceModePicker({
  disabled,
  onSelect,
  selectedAppearance,
}: AppearanceModePickerProps) {
  return (
    <section className="rounded-2xl bg-card p-3 sm:p-5">
      <ChoiceHeading
        title="Mode"
        description="Follow your device or keep one mode everywhere."
      />

      <fieldset
        aria-label="Appearance mode"
        className="mt-4 grid grid-cols-3 gap-2"
      >
        {APPEARANCE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedAppearance === option.id;

          return (
            <label
              key={option.id}
              className={cn(
                "group relative flex min-w-0 flex-col items-center rounded-xl bg-background/55 px-2 py-3 text-center shadow-soft-sm transition-[color,background-color,box-shadow] duration-150 motion-reduce:transition-none sm:py-4",
                isSelected
                  ? "bg-primary-soft text-ink shadow-soft-md"
                  : "text-slate-muted hover:text-ink hover:shadow-soft-md",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              )}
            >
              <input
                type="radio"
                name="appearance-mode"
                value={option.id}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onSelect(option.id)}
                className="absolute inset-0 size-full cursor-pointer appearance-none rounded-xl outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
              />
              <Icon
                className={cn(
                  "size-5",
                  isSelected ? "text-foreground" : "text-slate-muted",
                )}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span className="mt-2 font-bold text-sm">{option.label}</span>
              <span className="mt-1 hidden text-xs leading-snug sm:block">
                {MODE_DESCRIPTIONS[option.id]}
              </span>
              {isSelected ? (
                <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check
                    className="size-2.5"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
              ) : null}
            </label>
          );
        })}
      </fieldset>
    </section>
  );
}

function ChoiceHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div>
      <h3 className="font-bold text-base text-ink">{title}</h3>
      <p className="mt-1 text-slate-muted text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
