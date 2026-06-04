import { Link2, QrCode, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useProfileCommonFriends } from "@/features/profile/hooks/use-profile-common-friends";
import { buildPublicProfilePath } from "@/features/profile/lib/profile-route";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { getCurrentBrowserOrigin } from "@/shared/lib/browser-capabilities";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/schemas";
import { FriendRequestsList } from "./friend-requests-list";
import { FriendsList } from "./friends-list";
import { MutualFriendsList } from "./mutual-friends-list";
import { PublicFriendsList } from "./public-friends-list";

type TabValue = "friends" | "requests" | "public_friends";

export function ProfileFriendsPanel({
  user,
  initialTab = "friends",
}: {
  user: User;
  initialTab?: TabValue;
}) {
  const { data: currentUser } = useCurrentUserQuery();
  const isSelf = currentUser?.id === user.id;
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  const { commonFriends } = useProfileCommonFriends(
    !isSelf ? user.id : undefined,
  );

  const showPublicFriends = !isSelf && user.showFriendsListOnProfile;
  const showMutualFriends = !isSelf && (commonFriends?.length ?? 0) > 0;
  const profileQrUrl = `${getCurrentBrowserOrigin()}${buildPublicProfilePath(
    user.id,
    {
      intent: "connect",
    },
  )}`;

  const hasMultipleTabs = !isSelf
    ? showPublicFriends && showMutualFriends
    : true;

  if (!isSelf) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-black text-2xl text-foreground leading-tight tracking-tight">
            {activeTab === "friends" ? "Mutual Friends" : "Friends"}
          </h2>
          <p className="font-medium text-muted-foreground text-sm leading-relaxed">
            {activeTab === "friends"
              ? "People you both know."
              : "Their friends list."}
          </p>
        </div>

        {hasMultipleTabs && (
          <div className="flex gap-2 border-border border-b pb-1">
            <TabButton
              active={activeTab === "friends"}
              onClick={() => setActiveTab("friends")}
              icon={<Link2 className="size-4" />}
              label="Mutual Friends"
            />
            <TabButton
              active={activeTab === "public_friends"}
              onClick={() => setActiveTab("public_friends")}
              icon={<Users className="size-4" />}
              label="Friends"
            />
          </div>
        )}

        <div className="min-h-64">
          {activeTab === "friends" ? (
            <MutualFriendsList userId={user.id} />
          ) : (
            <PublicFriendsList userId={user.id} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-black text-2xl text-foreground leading-tight tracking-tight">
          Friends
        </h2>
        <p className="font-medium text-muted-foreground text-sm leading-relaxed">
          Manage your connections and incoming requests.
        </p>
      </div>

      <MyCodeCard user={user} url={profileQrUrl} />

      <div className="flex gap-2 border-border border-b pb-1">
        <TabButton
          active={activeTab === "friends"}
          onClick={() => setActiveTab("friends")}
          icon={<Users className="size-4" />}
          label="My Friends"
        />
        <TabButton
          active={activeTab === "requests"}
          onClick={() => setActiveTab("requests")}
          icon={<UserPlus className="size-4" />}
          label="Requests"
        />
      </div>

      <div className="min-h-64">
        {activeTab === "friends" ? <FriendsList /> : <FriendRequestsList />}
      </div>
    </div>
  );
}

function MyCodeCard({ url, user }: { url: string; user: User }) {
  return (
    <div className="rounded-2xl border border-forge-teal/20 bg-forge-teal/6 p-4">
      <div className="flex items-start gap-3">
        <IconTile
          bordered
          icon={QrCode}
          shape="circle"
          size="md"
          tone="teal"
          className="mt-0.5 bg-forge-teal/8"
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
          title="My TeamForge Code"
          description="Scan to open this profile and connect in person."
          avatarSrc={user.avatar}
          bottomText={`@${user.name.replace(/\s/g, "").toLowerCase()}`}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-lg border-forge-teal/25 bg-background/80 text-forge-teal hover:bg-forge-teal/8"
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

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2 rounded-md px-3 py-2 font-semibold text-sm transition-colors",
        "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {icon}
      {label}
      {active && (
        <span
          className="absolute right-0 bottom-[-1.25px] left-0 h-0.5 bg-forge-teal"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
