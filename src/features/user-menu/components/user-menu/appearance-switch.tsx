import type { LucideIcon } from "lucide-react";
import { Moon, Sun } from "lucide-react";

import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";
import { Theme, useTheme } from "@/shared/store/theme.store";

export function AppearanceSwitch() {
  const { theme, setTheme } = useTheme();
  const CurrentIcon = theme === Theme.DARK ? Moon : Sun;

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2">
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

      <div className="grid w-36 shrink-0 grid-cols-2 gap-1 rounded-full border border-border/70 bg-card p-1.5">
        <AppearanceOption
          icon={Sun}
          isActive={theme === Theme.LIGHT}
          label="Light"
          onClick={() => setTheme(Theme.LIGHT)}
        />
        <AppearanceOption
          icon={Moon}
          isActive={theme === Theme.DARK}
          label="Dark"
          onClick={() => setTheme(Theme.DARK)}
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
        "flex h-7 items-center justify-center gap-1.5 rounded-full px-2 font-black text-xs transition-all duration-150",
        isActive
          ? "bg-forge-teal text-white shadow-forge-teal/20 shadow-sm"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <Icon size={11} aria-hidden="true" />
      {label}
    </button>
  );
}
