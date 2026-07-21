import { BoxBordersSwitch } from "@/shared/components/dev/box-borders-switch";
import { TailwindIndicator } from "@/shared/components/dev/tailwindIndicator";
import { areDevelopmentToolsEnabled } from "@/shared/lib/development-tools";

export function DevTools() {
  if (!areDevelopmentToolsEnabled()) {
    return null;
  }

  return (
    <div className="fixed right-2 bottom-2 z-10000 flex flex-col items-end gap-1">
      <TailwindIndicator />
      <BoxBordersSwitch />
    </div>
  );
}
