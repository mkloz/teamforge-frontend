import { useId } from "react";
import { DEVICE_TABS } from "@/features/download/data/download-install-steps";
import type { SelectedDevice } from "@/features/download/download-page-view-state";
import { cn } from "@/shared/lib/utils";

interface DownloadDeviceTabsProps {
  ariaLabel: string;
  onChange: (value: SelectedDevice) => void;
  value: SelectedDevice;
}

export function DownloadDeviceTabs({
  ariaLabel,
  onChange,
  value,
}: DownloadDeviceTabsProps) {
  const groupId = useId();

  return (
    <fieldset className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/15 bg-white/8 p-0.5 shadow-sm backdrop-blur-sm">
      <legend className="sr-only">{ariaLabel}</legend>
      {DEVICE_TABS.map((option) => {
        const active = value === option.id;
        const Icon = option.icon;
        const inputId = `${groupId}-${option.id}`;

        return (
          <label
            key={option.id}
            htmlFor={inputId}
            className={cn(
              "relative inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 font-bold text-xs leading-none outline-none transition-colors duration-200 has-focus-visible:ring-2 has-focus-visible:ring-forge-teal/70 has-focus-visible:ring-offset-1 has-focus-visible:ring-offset-hero-bg",
              active
                ? "bg-forge-teal text-white shadow-[0_2px_0_#063b37]"
                : "text-white/62 hover:bg-white/8 hover:text-white",
            )}
          >
            <input
              id={inputId}
              type="radio"
              name={`${groupId}-device`}
              value={option.id}
              checked={active}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            <Icon
              className={cn(
                "size-3.5 shrink-0 transition-opacity duration-200",
                active ? "opacity-100" : "opacity-70",
              )}
              strokeWidth={active ? 2 : 1.5}
              aria-hidden="true"
            />
            <span
              className={cn(
                "min-w-0 truncate",
                option.shortLabel && "hidden sm:inline",
              )}
            >
              {option.label}
            </span>
            {option.shortLabel && (
              <span className="min-w-0 truncate sm:hidden">
                {option.shortLabel}
              </span>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
