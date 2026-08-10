import { QrCode } from "lucide-react";
import { getProfileQrHandle } from "@/features/profile/components/profile-friends-panel/profile-friends-panel/friends-panel-state";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import type { User } from "@/shared/schemas";

export function MyCodeCard({ url, user }: { url: string; user: User }) {
  return (
    <div className="rounded-2xl border border-brand-teal/20 bg-primary-soft p-4">
      <div className="flex items-start gap-3">
        <IconTile
          bordered
          icon={QrCode}
          shape="circle"
          size="md"
          tone="teal"
          className="mt-0.5 bg-primary-soft"
        />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground text-sm leading-tight">
            My Code
          </p>
          <p className="mt-1 max-w-64 text-muted-foreground text-xs leading-relaxed">
            Let someone scan this at an activity to open your profile with
            Connect ready.
          </p>
        </div>
        <QrShareDialog
          url={url}
          title="My Findafew Code"
          description="Scan to open this profile and connect in person."
          avatarSrc={user.avatar}
          bottomText={getProfileQrHandle(user.name)}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-lg border-brand-teal/25 bg-background/80 text-foreground hover:bg-primary-soft"
            >
              <QrCode className="size-4" />
              Show
            </Button>
          }
        />
      </div>
    </div>
  );
}
