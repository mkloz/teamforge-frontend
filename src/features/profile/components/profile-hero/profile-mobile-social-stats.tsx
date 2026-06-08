import { Link2, UserPlus, Users } from "lucide-react";
import { useProfileCommonFriends } from "@/features/profile/hooks/use-profile-common-friends";
import { useProfileFriendRequests } from "@/features/profile/hooks/use-profile-friend-requests";
import { useProfileFriends } from "@/features/profile/hooks/use-profile-friends";
import { useProfilePublicFriends } from "@/features/profile/hooks/use-profile-public-friends";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { SheetTrigger } from "@/shared/components/ui/sheet";
import type { User } from "@/shared/schemas";

interface ProfileMobileSocialStatsProps {
  user: User;
  onOpenFriends?: (tab: "friends" | "requests" | "public_friends") => void;
}

export function ProfileMobileSocialStats({
  user,
  onOpenFriends,
}: ProfileMobileSocialStatsProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const isSelf = currentUser?.id === user.id;

  const { friends } = useProfileFriends();
  const { requests } = useProfileFriendRequests();
  const { commonFriends } = useProfileCommonFriends(
    !isSelf ? user.id : undefined,
  );
  const { publicFriends } = useProfilePublicFriends(
    !isSelf && user.showFriendsListOnProfile ? user.id : "",
  );

  const friendsCount = friends?.length ?? 0;
  const requestsCount = requests?.length ?? 0;
  const commonFriendsCount = commonFriends?.length ?? 0;
  const publicFriendsCount = publicFriends?.length ?? 0;

  const canShowPublicFriends = !isSelf && user.showFriendsListOnProfile;

  if (!isSelf && commonFriendsCount === 0 && !canShowPublicFriends) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-border/40 border-t pt-5 sm:hidden">
      {isSelf ? (
        <>
          <SheetTrigger asChild>
            <button
              type="button"
              onClick={() => onOpenFriends?.("friends")}
              className="group inline-flex items-center gap-2.5 rounded-full border border-forge-teal/15 bg-forge-teal/5 py-1.5 pr-4 pl-2 transition-all hover:border-forge-teal/30 hover:bg-forge-teal/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal active:scale-[0.97]"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-forge-teal/15 text-forge-teal transition-transform group-hover:scale-105">
                <Users className="size-3.5" />
              </div>
              <span className="font-semibold text-ink text-sm">
                {friendsCount}{" "}
                <span className="font-medium text-slate-muted">Friends</span>
              </span>
            </button>
          </SheetTrigger>

          {requestsCount > 0 && (
            <SheetTrigger asChild>
              <button
                type="button"
                onClick={() => onOpenFriends?.("requests")}
                className="group inline-flex items-center gap-2.5 rounded-full border border-spark-amber/15 bg-spark-amber/5 py-1.5 pr-4 pl-2 transition-all hover:border-spark-amber/30 hover:bg-spark-amber/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-spark-amber active:scale-[0.97]"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-spark-amber/15 text-spark-amber transition-transform group-hover:scale-105">
                  <UserPlus className="size-3.5" />
                </div>
                <span className="font-semibold text-ink text-sm">
                  {requestsCount}{" "}
                  <span className="font-medium text-slate-muted">Requests</span>
                </span>
              </button>
            </SheetTrigger>
          )}
        </>
      ) : (
        <>
          {canShowPublicFriends && (
            <SheetTrigger asChild>
              <button
                type="button"
                onClick={() => onOpenFriends?.("public_friends")}
                className="group inline-flex items-center gap-2.5 rounded-full border border-forge-teal/15 bg-forge-teal/5 py-1.5 pr-4 pl-2 transition-all hover:border-forge-teal/30 hover:bg-forge-teal/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal active:scale-[0.97]"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-forge-teal/15 text-forge-teal transition-transform group-hover:scale-105">
                  <Users className="size-3.5" />
                </div>
                <span className="font-semibold text-ink text-sm">
                  {publicFriendsCount}{" "}
                  <span className="font-medium text-slate-muted">Friends</span>
                </span>
              </button>
            </SheetTrigger>
          )}

          {commonFriendsCount > 0 && (
            <SheetTrigger asChild>
              <button
                type="button"
                onClick={() => onOpenFriends?.("friends")}
                className="inline-flex items-center gap-2.5 rounded-full border border-slate-muted/20 bg-canvas py-1.5 pr-4 pl-2 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-muted/10 text-slate-muted">
                  <Link2 className="size-3.5" />
                </div>
                <span className="font-semibold text-ink text-sm">
                  {commonFriendsCount}{" "}
                  <span className="font-medium text-slate-muted">
                    Mutual Friends
                  </span>
                </span>
              </button>
            </SheetTrigger>
          )}
        </>
      )}
    </div>
  );
}
