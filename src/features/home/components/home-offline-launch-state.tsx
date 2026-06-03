import { Link } from "@tanstack/react-router";
import { MessagesSquare, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";

interface HomeOfflineLaunchStateProps {
  onRetry: () => void;
}

export function HomeOfflineLaunchState({
  onRetry,
}: HomeOfflineLaunchStateProps) {
  return (
    <section
      aria-labelledby="home-offline-heading"
      className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-screen-2xl items-center px-4 pt-3 pb-8 sm:px-5 md:pt-6 lg:px-8"
    >
      <div
        role="status"
        className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-spark-amber/35 bg-card px-5 py-6 shadow-sm sm:px-7 sm:py-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start"
      >
        <IconTile
          bordered
          shape="square"
          size="2xl"
          tone="amber"
          className="rounded-2xl border-spark-amber/35 bg-spark-amber/12"
        >
          <WifiOff size={26} strokeWidth={1.8} aria-hidden="true" />
        </IconTile>

        <div className="min-w-0">
          <p className="font-bold text-spark-amber text-xs">Offline launch</p>
          <h1
            id="home-offline-heading"
            className="mt-2 font-black text-3xl text-ink leading-tight tracking-tight sm:text-4xl"
          >
            Home needs the network to refresh.
          </h1>
          <p className="mt-3 max-w-xl font-medium text-base text-slate-muted leading-relaxed">
            TeamForge opened, but your private plans, groups, and invitations
            are not cached on this device. Reconnect and Home will pick up live
            activity again.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onRetry}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/activity">
                <MessagesSquare size={16} aria-hidden="true" />
                Open activity
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
