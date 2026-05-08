import { Moon, Sun } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Theme, useTheme } from "@/shared/store/theme.store";

import { SectionHeading } from "./preference-section-parts";

const THEME_OPTIONS = [
  {
    value: Theme.LIGHT,
    label: "Light",
    description: "A brighter interface for daytime use.",
    icon: Sun,
  },
  {
    value: Theme.DARK,
    label: "Dark",
    description: "A lower-glare interface for evening use.",
    icon: Moon,
  },
] as const;

export function AppearanceSettingsSection() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <SectionHeading
        title="Appearance"
        description="Choose how TeamForge should look on this device."
      />

      <div className="border-border border-t">
        <div className="flex flex-col gap-3 py-5 sm:flex-row">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = theme === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant={active ? "primary" : "outline"}
                onClick={() => setTheme(option.value)}
                aria-pressed={active}
                className="h-auto flex-1 justify-start p-4 text-left"
                contentClassName="items-start justify-start gap-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-current/10">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-black text-sm">
                    {option.label}
                  </span>
                  <span className="mt-1 block font-medium text-xs leading-relaxed opacity-75">
                    {option.description}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
