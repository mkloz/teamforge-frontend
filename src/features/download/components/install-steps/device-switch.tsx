import { Fragment } from "react";
import { INSTALL_DEVICE_SWITCH_OPTIONS } from "@/features/download/data/download-install-steps";
import type { SelectedDevice } from "@/features/download/download-page-view-state";

const INSTALL_DEVICE_SWITCH_BUTTON_CLASS =
  "inline-flex min-h-11 items-center rounded-md font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:text-secondary-foreground";

interface InstallDeviceSwitchProps {
  onSelectedDeviceChange: (value: SelectedDevice) => void;
  selectedDevice: SelectedDevice;
}

export function InstallDeviceSwitch({
  onSelectedDeviceChange,
  selectedDevice,
}: InstallDeviceSwitchProps) {
  const options = INSTALL_DEVICE_SWITCH_OPTIONS.filter(
    (option) => option.id !== selectedDevice,
  );

  return (
    <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-slate-muted text-sm">
      <span>Wrong device?</span>
      {options.map((option, index) => (
        <Fragment key={option.id}>
          {index > 0 && "·"}
          <button
            type="button"
            className={INSTALL_DEVICE_SWITCH_BUTTON_CLASS}
            onClick={() => {
              onSelectedDeviceChange(option.id);
            }}
          >
            {option.label}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
