import type { LucideIcon } from "lucide-react";
import { Monitor, Moon, Sun } from "lucide-react";

import { IconTile } from "@/shared/components/ui/icon-tile";
import { ThemeAppearance } from "@/shared/constants/theme-preferences";
import { cn } from "@/shared/lib/utils";
import { useTheme } from "@/shared/store/theme.store";

export function AppearanceSwitch() {
  const { appearance, setAppearance, isDark } = useTheme();
  const CurrentIcon =
    appearance === ThemeAppearance.SYSTEM ? Monitor : isDark ? Moon : Sun;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-card px-4 py-3">
      <IconTile
        icon={CurrentIcon}
        tone="teal"
        size="md"
        className="bg-transparent"
        aria-hidden="true"
      />

      <span className="min-w-0 flex-1">
        <span className="block font-bold text-foreground text-sm">
          Appearance
        </span>
        <span className="mt-0.5 block text-muted-foreground text-xs">
          {getAppearanceLabel(appearance)}
        </span>
      </span>

      <div className="grid shrink-0 grid-cols-3 gap-1 rounded-full bg-background p-1">
        <AppearanceOption
          icon={Monitor}
          isActive={appearance === ThemeAppearance.SYSTEM}
          label="Auto"
          onClick={() => setAppearance(ThemeAppearance.SYSTEM)}
        />
        <AppearanceOption
          icon={Sun}
          isActive={appearance === ThemeAppearance.LIGHT}
          label="Light"
          onClick={() => setAppearance(ThemeAppearance.LIGHT)}
        />
        <AppearanceOption
          icon={Moon}
          isActive={appearance === ThemeAppearance.DARK}
          label="Dark"
          onClick={() => setAppearance(ThemeAppearance.DARK)}
        />
      </div>
    </div>
  );
}

interface AppearanceOptionProps {
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function AppearanceOption({
  icon: Icon,
  isActive,
  label,
  onClick,
}: AppearanceOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-full font-black text-xs transition-colors",
        isActive
          ? "bg-primary text-primary-foreground shadow-primary/20 shadow-sm"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
      title={label}
    >
      <Icon size={13} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function getAppearanceLabel(appearance: ThemeAppearance) {
  if (appearance === ThemeAppearance.SYSTEM) {
    return "Match this device";
  }

  return appearance === ThemeAppearance.DARK ? "Dark theme" : "Light theme";
}
