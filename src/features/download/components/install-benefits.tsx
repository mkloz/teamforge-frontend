import Download from "lucide-react/dist/esm/icons/download.js";
import { CAPABILITIES } from "@/features/download/data/download-install-steps";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

export function InstallBenefitsSection() {
  return (
    <section className="bg-canvas" aria-labelledby="install-benefits-title">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <p className="font-semibold text-forge-teal text-xs">
              Why install it
            </p>
            <h2
              id="install-benefits-title"
              className="mt-3 max-w-lg font-extrabold text-3xl text-ink leading-tight sm:text-4xl"
            >
              Make TeamForge feel closer than another tab.
            </h2>
            <p className="mt-4 max-w-md text-pretty text-slate-muted leading-relaxed">
              Install gives the group flow a permanent place on your device,
              with faster returns and alerts ready when plans move.
            </p>

            <div className="mt-8 border-forge-teal/20 border-y py-5">
              <div className="flex items-start gap-4">
                <IconTile
                  bordered
                  icon={Download}
                  shape="circle"
                  size="lg"
                  tone="teal"
                  className="size-11 bg-forge-teal/8"
                  iconClassName="size-5"
                />
                <div>
                  <p className="font-bold text-ink">
                    Browser install, app-like focus
                  </p>
                  <p className="mt-1 text-slate-muted text-sm leading-relaxed">
                    No app store. No tab hunting when a group is waiting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ul
            className="grid sm:grid-cols-2 lg:col-span-3 lg:border-border/60 lg:border-l lg:pl-8"
            aria-label="App capabilities"
          >
            {CAPABILITIES.map((cap, i) => (
              <CapabilityTile
                capability={cap}
                index={i}
                key={cap.title}
                total={CAPABILITIES.length}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

interface CapabilityTileProps {
  capability: (typeof CAPABILITIES)[number];
  index: number;
  total: number;
}

function getCapabilityCellBorderClasses(index: number, total: number) {
  return cn(
    index < total - 1 ? "border-b" : "border-b-0",
    index % 2 === 0 ? "sm:border-r" : "sm:border-r-0",
    index < total - 2 ? "sm:border-b" : "sm:border-b-0",
  );
}

function CapabilityTile({ capability, index, total }: CapabilityTileProps) {
  const CapIcon = capability.icon;

  return (
    <li
      className={cn(
        "min-w-0 border-border/60 py-6 transition-colors duration-200 hover:bg-background/45 sm:p-6",
        getCapabilityCellBorderClasses(index, total),
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <IconTile
          bordered
          icon={CapIcon}
          shape="circle"
          size="xl"
          tone="teal"
          className="bg-forge-teal/8"
          iconClassName="size-5.5"
        />
        <span
          className="font-extrabold text-3xl text-slate-muted/30 leading-none"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-5 font-bold text-ink text-lg">{capability.title}</h3>
      <p className="mt-2 max-w-sm text-slate-muted leading-relaxed">
        {capability.body}
      </p>
    </li>
  );
}
