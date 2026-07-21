import { Link } from "@tanstack/react-router";
import { type ReactNode, type Ref, useState } from "react";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { buildSettingsNavigation } from "@/shared/navigation/settings-navigation";
import type { User } from "@/shared/schemas";
import { ProfileFriendsPanel } from "../profile-friends-panel";
import { ProfileActions } from "./profile-actions";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileIdentity } from "./profile-identity";
import { ProfileMobileSocialStats } from "./profile-mobile-social-stats";

interface ProfileHeroProps {
  user: User;
  archetype: string;
  socialRead?: string | null;
  renderActions?: () => ReactNode;
  showMissingDetailsAction?: boolean;
  heroRowRef?: Ref<HTMLDivElement>;
}

export function ProfileHero({
  user,
  archetype,
  socialRead,
  renderActions,
  showMissingDetailsAction = true,
  heroRowRef,
}: ProfileHeroProps) {
  const hasBio = Boolean(user.bio?.trim());
  const [friendsTab, setFriendsTab] = useState<
    "friends" | "requests" | "public_friends"
  >("friends");
  const { data: currentUser } = useCurrentUserQuery();
  const isSelf = currentUser?.id === user.id;
  const ProfileActionsSlot = renderActions ?? ProfileActions;

  return (
    <Sheet>
      <div className="relative flex w-full flex-col pb-4 sm:px-0 sm:pb-8">
        <div className="flex w-full flex-col gap-5 sm:gap-6 lg:gap-9">
          <div className="flex w-full flex-col justify-between gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="relative min-w-0 flex-1">
              <div
                ref={heroRowRef}
                className="transform-[translate3d(0,var(--profile-hero-original-y,0px),0)] relative top-2 flex w-full min-w-0 flex-row items-start gap-4 opacity-(--profile-hero-original-opacity,1) transition-[opacity,transform] duration-300 ease-out [transition-delay:var(--profile-hero-original-delay,0ms)] motion-reduce:transition-none sm:top-1 sm:gap-6 md:top-5"
              >
                <ProfileAvatar
                  src={user.avatar}
                  name={user.name}
                  onlineStatus={user.onlineStatus}
                />
                <ProfileIdentity
                  user={user}
                  archetype={archetype}
                  actions={<ProfileActionsSlot />}
                  showMissingDetailsAction={showMissingDetailsAction}
                  onOpenFriends={setFriendsTab}
                />
              </div>
            </div>
          </div>

          <ExpandedProfileSummary
            canEdit={isSelf && showMissingDetailsAction}
            hasBio={hasBio}
            socialRead={socialRead}
            userBio={user.bio}
          >
            <div className="lg:hidden">
              <ProfileActionsSlot />
            </div>
            <ProfileMobileSocialStats
              user={user}
              onOpenFriends={setFriendsTab}
            />
          </ExpandedProfileSummary>
        </div>
      </div>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="sr-only mb-6">
          <SheetTitle>
            {isSelf ? "Friends Management" : "Mutual Friends"}
          </SheetTitle>
        </SheetHeader>
        <ProfileFriendsPanel
          user={user}
          activeTab={friendsTab}
          onTabChange={setFriendsTab}
        />
      </SheetContent>
    </Sheet>
  );
}

interface ExpandedProfileSummaryProps {
  canEdit: boolean;
  children: ReactNode;
  hasBio: boolean;
  socialRead?: string | null;
  userBio?: string | null;
}

function ExpandedProfileSummary({
  canEdit,
  children,
  hasBio,
  socialRead,
  userBio,
}: ExpandedProfileSummaryProps) {
  const summary = hasBio ? userBio : socialRead;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <blockquote className="relative max-w-136 sm:mx-0 sm:max-w-2xl">
        {summary ? (
          <p className="relative z-10 text-pretty font-medium text-base text-ink/82 leading-relaxed md:text-xl">
            {summary}
          </p>
        ) : (
          <MissingProfileSummary canEdit={canEdit} />
        )}
      </blockquote>

      {children}
    </div>
  );
}

function MissingProfileSummary({ canEdit }: { canEdit: boolean }) {
  if (!canEdit) {
    return (
      <p className="text-pretty text-slate-muted text-sm leading-relaxed">
        No introduction has been added yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-pretty text-slate-muted text-sm leading-relaxed">
        Add a short introduction so people know what kinds of plans you enjoy.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link {...buildSettingsNavigation("account")}>Add an introduction</Link>
      </Button>
    </div>
  );
}
