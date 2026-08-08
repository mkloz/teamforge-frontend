import { QrCode } from "lucide-react";
import { lazy, Suspense } from "react";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import type { User } from "@/shared/schemas";
import { getProfileQrHandle } from "./profile-page-state";
import { ProfileUserMenuFallback } from "./profile-user-menu-fallback";

const LazyUserMenu = lazy(() =>
  import("@/features/app-shell/public/user-menu").then((module) => ({
    default: module.UserMenu,
  })),
);

export function ProfileHeaderActions({
  profile,
  profileQrUrl,
}: {
  profile: User;
  profileQrUrl: string;
}) {
  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-3 md:top-6 md:right-8">
      <QrShareDialog
        url={profileQrUrl}
        avatarSrc={profile.avatar}
        bottomText={getProfileQrHandle(profile.name)}
        trigger={
          <Button
            variant="inverseGhost"
            size="icon"
            className="size-10 shrink-0 rounded-full border border-white/25 bg-white/15 text-white shadow-sm focus-visible:ring-white active:enabled:bg-white/85 active:enabled:text-foreground hover:enabled:border-white/65 hover:enabled:bg-white hover:enabled:text-foreground data-[state=open]:bg-white data-[state=open]:text-foreground"
            aria-label="Show QR Code"
          >
            <QrCode size={18} strokeWidth={2.25} aria-hidden="true" />
          </Button>
        }
      />
      <Suspense fallback={<ProfileUserMenuFallback />}>
        <LazyUserMenu trigger="settings" />
      </Suspense>
    </div>
  );
}
