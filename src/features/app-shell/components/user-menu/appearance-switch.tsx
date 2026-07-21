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
    <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl px-3 py-2">
      <IconTile
        icon={CurrentIcon}
        tone="neutral"
        size="md"
        bordered
        aria-hidden="true"
      />

      <span className="min-w-0 flex-1 font-semibold text-foreground text-sm">
        Theme
      </span>

      <div className="grid w-full min-w-0 basis-full grid-cols-3 gap-1 rounded-full border border-border/70 bg-card p-1.5 md:w-52 md:shrink-0 md:basis-auto">
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
        "flex h-11 items-center justify-center gap-1.5 rounded-full px-2 font-black text-xs transition-all duration-150 md:h-7",
        isActive
          ? "bg-primary text-primary-foreground shadow-primary/20 shadow-sm"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <Icon size={11} aria-hidden="true" />
      {label}
    </button>
  );
}
