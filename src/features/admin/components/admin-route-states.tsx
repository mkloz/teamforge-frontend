import { Link } from "@tanstack/react-router";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { ForgeLoadingMark } from "@/shared/components/loading/forge-loading-mark";
import { Button } from "@/shared/components/ui/button";
import { buildHomeNavigation } from "@/shared/navigation/home-navigation";

export function AdminRouteLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-6 text-ink">
      <ForgeLoadingMark label="Checking admin access" size="md" />
    </div>
  );
}

export function AdminAccessUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-6 py-12 text-center">
      <div className="grid max-w-md gap-3">
        <ShieldAlert
          className="mx-auto size-9 text-primary"
          aria-hidden="true"
        />
        <h1 className="font-bold text-2xl text-ink">
          Admin access could not be checked
        </h1>
        <p className="text-pretty text-slate-muted text-sm leading-relaxed">
          Reconnect and try again. The admin workspace stays closed until
          TeamForge can confirm your access.
        </p>
        <div className="mt-2 flex flex-col justify-center gap-2 sm:flex-row">
          <Button type="button" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Check access again
          </Button>
          <Button asChild variant="outline">
            <Link {...buildHomeNavigation()}>Back to TeamForge</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
