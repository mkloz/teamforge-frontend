import { Link2, type LucideIcon, QrCode, UserPlus, Users } from "lucide-react";
import { type ReactNode, useState } from "react";
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

interface FriendsPanelTabItem {
  Icon: LucideIcon;
  label: string;
  value: TabValue;
}

const PUBLIC_FRIENDS_COPY: Record<
  "friends" | "public_friends",
  { description: string; title: string }
> = {
  friends: {
    title: "Mutual Friends",
    description: "People you both know.",
  },
  public_friends: {
    title: "Friends",
    description: "Their friends list.",
  },
};

const PUBLIC_FRIENDS_TAB_ITEMS = [
  {
    Icon: Link2,
    label: "Mutual Friends",
    value: "friends",
  },
  {
    Icon: Users,
    label: "Friends",
    value: "public_friends",
  },
] as const satisfies readonly FriendsPanelTabItem[];

const SELF_FRIENDS_TAB_ITEMS = [
  {
    Icon: Users,
    label: "My Friends",
    value: "friends",
  },
  {
    Icon: UserPlus,
    label: "Requests",
    value: "requests",
  },
] as const satisfies readonly FriendsPanelTabItem[];

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

  const publicPanelState = getPublicFriendsPanelState({
    commonFriendCount: commonFriends?.length ?? 0,
    isSelf,
    showFriendsListOnProfile: user.showFriendsListOnProfile,
  });
  const profileQrUrl = getProfileQrUrl(user.id);

  if (!isSelf) {
    return (
      <PublicProfileFriendsPanel
        activeTab={activeTab}
        hasMultipleTabs={publicPanelState.hasMultipleTabs}
        onTabChange={setActiveTab}
        userId={user.id}
      />
    );
  }

  return (
    <SelfProfileFriendsPanel
      activeTab={activeTab}
      onTabChange={setActiveTab}
      profileQrUrl={profileQrUrl}
      user={user}
    />
  );
}

function PublicProfileFriendsPanel({
  activeTab,
  hasMultipleTabs,
  onTabChange,
  userId,
}: {
  activeTab: TabValue;
  hasMultipleTabs: boolean;
  onTabChange: (tab: TabValue) => void;
  userId: string;
}) {
  const copy = getPublicFriendsCopy(activeTab);

  return (
    <div className="flex flex-col gap-6">
      <FriendsPanelHeader description={copy.description} title={copy.title} />

      {hasMultipleTabs && (
        <PublicFriendsTabs activeTab={activeTab} onTabChange={onTabChange} />
      )}

      <PublicFriendsPanelContent activeTab={activeTab} userId={userId} />
    </div>
  );
}

function SelfProfileFriendsPanel({
  activeTab,
  onTabChange,
  profileQrUrl,
  user,
}: {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  profileQrUrl: string;
  user: User;
}) {
  return (
    <div className="flex flex-col gap-6">
      <FriendsPanelHeader
        description="Manage your connections and incoming requests."
        title="Friends"
      />

      <MyCodeCard user={user} url={profileQrUrl} />

      <SelfFriendsTabs activeTab={activeTab} onTabChange={onTabChange} />

      <SelfFriendsPanelContent activeTab={activeTab} />
    </div>
  );
}

function FriendsPanelHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="font-black text-2xl text-foreground leading-tight tracking-tight">
        {title}
      </h2>
      <p className="font-medium text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function PublicFriendsTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}) {
  return (
    <FriendsTabs
      activeTab={activeTab}
      items={PUBLIC_FRIENDS_TAB_ITEMS}
      onTabChange={onTabChange}
    />
  );
}

function SelfFriendsTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}) {
  return (
    <FriendsTabs
      activeTab={activeTab}
      items={SELF_FRIENDS_TAB_ITEMS}
      onTabChange={onTabChange}
    />
  );
}

function FriendsTabs({
  activeTab,
  items,
  onTabChange,
}: {
  activeTab: TabValue;
  items: readonly FriendsPanelTabItem[];
  onTabChange: (tab: TabValue) => void;
}) {
  return (
    <div className="flex gap-2 border-border border-b pb-1">
      {items.map((item) => (
        <FriendsTabButton
          key={item.value}
          activeTab={activeTab}
          item={item}
          onTabChange={onTabChange}
        />
      ))}
    </div>
  );
}

function FriendsTabButton({
  activeTab,
  item,
  onTabChange,
}: {
  activeTab: TabValue;
  item: FriendsPanelTabItem;
  onTabChange: (tab: TabValue) => void;
}) {
  const Icon = item.Icon;

  return (
    <TabButton
      active={activeTab === item.value}
      onClick={() => onTabChange(item.value)}
      icon={<Icon className="size-4" />}
      label={item.label}
    />
  );
}

function PublicFriendsPanelContent({
  activeTab,
  userId,
}: {
  activeTab: TabValue;
  userId: string;
}) {
  return (
    <div className="min-h-64">
      {activeTab === "friends" ? (
        <MutualFriendsList userId={userId} />
      ) : (
        <PublicFriendsList userId={userId} />
      )}
    </div>
  );
}

function SelfFriendsPanelContent({ activeTab }: { activeTab: TabValue }) {
  return (
    <div className="min-h-64">
      {activeTab === "friends" ? <FriendsList /> : <FriendRequestsList />}
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
          bottomText={getProfileQrHandle(user.name)}
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
  icon: ReactNode;
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

function getPublicFriendsCopy(activeTab: TabValue) {
  return activeTab === "friends"
    ? PUBLIC_FRIENDS_COPY.friends
    : PUBLIC_FRIENDS_COPY.public_friends;
}

function getPublicFriendsPanelState({
  commonFriendCount,
  isSelf,
  showFriendsListOnProfile,
}: {
  commonFriendCount: number;
  isSelf: boolean;
  showFriendsListOnProfile: boolean;
}) {
  if (isSelf) {
    return { hasMultipleTabs: true };
  }

  return {
    hasMultipleTabs: showFriendsListOnProfile && commonFriendCount > 0,
  };
}

function getProfileQrUrl(userId: string) {
  return `${getCurrentBrowserOrigin()}${buildPublicProfilePath(userId, {
    intent: "connect",
  })}`;
}

function getProfileQrHandle(name: User["name"]) {
  return `@${name.replace(/\s/g, "").toLowerCase()}`;
}
