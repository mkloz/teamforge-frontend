import { Moon, Sun, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Theme, useTheme } from "@/shared/store/theme.store";

export function AppearanceSwitch() {
  const { theme, setTheme } = useTheme();
  const CurrentIcon = theme === Theme.DARK ? Moon : Sun;

  return (
    <section className="flex items-center justify-between gap-3 border-y border-border/70 px-5 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center text-forge-teal">
          <CurrentIcon size={16} aria-hidden="true" />
        </span>
        <p className="truncate text-sm font-black text-foreground">Theme</p>
      </div>

      <div className="grid w-36 shrink-0 grid-cols-2 gap-1 rounded-full border border-border/70 bg-card p-1">
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
    </section>
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
        "flex h-7 items-center justify-center gap-1.5 rounded-full text-xs font-black transition-[background-color,color,box-shadow] duration-150",
        isActive
          ? "bg-forge-teal text-white shadow-sm shadow-forge-teal/20"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <Icon size={13} aria-hidden="true" />
      {label}
    </button>
  );
}
