import { RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface PwaDiagnosticsHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function PwaDiagnosticsHeader({
  isRefreshing,
  onRefresh,
}: PwaDiagnosticsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 font-semibold text-forge-teal text-xs">
          Device readiness
        </p>
        <div className="flex items-center justify-between gap-4">
          <h2
            id="pwa-diagnostics-title"
            className="font-extrabold text-2xl text-ink sm:text-3xl"
          >
            Installation checks
          </h2>
          <Button
            aria-label="Refresh diagnostics"
            className="shrink-0 rounded-full sm:hidden"
            loading={isRefreshing}
            onClick={onRefresh}
            size="icon"
            variant="outline"
          >
            <RefreshCw size={17} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
        <p className="mt-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          Check installation, whether TeamForge can start without a connection,
          and notifications on this device.
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="hidden min-h-11 sm:inline-flex [@media(pointer:fine)]:min-h-9"
        loading={isRefreshing}
        onClick={onRefresh}
      >
        <RefreshCw size={15} strokeWidth={2} aria-hidden="true" />
        Refresh checks
      </Button>
    </div>
  );
}
