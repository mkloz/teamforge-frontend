import { GoogleIcon } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import { GroupedMenuItem } from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { getUserSignInMethods } from "@/shared/lib/user-sign-in-methods";
import type { User } from "@/shared/schemas";

interface GoogleConnectionSectionProps {
  currentUser: User | undefined;
  isConnecting: boolean;
  isOnline: boolean;
  onConnect: () => void;
  onIntent: () => void;
}

export function GoogleConnectionSection({
  currentUser,
  isConnecting,
  isOnline,
  onConnect,
  onIntent,
}: GoogleConnectionSectionProps) {
  const isConnected = getUserSignInMethods(currentUser).google;
  const isDisabled = !isOnline || isConnecting;

  return (
    <GroupedMenuItem>
      <div className="flex min-h-16 flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:px-5">
        <IconTile shape="circle" size="lg" tone="neutral">
          <GoogleIcon />
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink text-sm">Google sign-in</p>
          <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
            {isConnected
              ? "Use your Google account whenever it is more convenient."
              : "Connect the Google account with the same email address."}
          </p>
        </div>
        {isConnected ? (
          <StatusPill size="xs" surface="soft" tone="teal">
            Connected
          </StatusPill>
        ) : (
          <Button
            className="w-full sm:w-auto"
            disabled={isDisabled}
            loading={isConnecting}
            onClick={onConnect}
            onFocus={onIntent}
            onPointerEnter={onIntent}
            size="sm"
            title={isOnline ? undefined : "Reconnect before connecting Google."}
            type="button"
            variant="outline"
          >
            <GoogleIcon />
            {isConnecting ? "Connecting..." : "Connect Google"}
          </Button>
        )}
      </div>
    </GroupedMenuItem>
  );
}
