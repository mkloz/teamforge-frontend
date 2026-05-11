import { ArrowRight, RefreshCcw } from "lucide-react";
import type { ReactNode } from "react";

import { ActivityNoConversationSelectedVisual } from "@/assets/empty-state/activity-no-conversation-selected";
import { EmptyActiveSessionsVisual } from "@/assets/empty-state/empty-active-sessions";
import { EmptyConversationsVisual } from "@/assets/empty-state/empty-conversations";
import { EmptyConversationsFilteredVisual } from "@/assets/empty-state/empty-conversations-filtered";
import { EmptyExploreFilteredVisual } from "@/assets/empty-state/empty-explore-filtered";
import { EmptyExploreOpenVisual } from "@/assets/empty-state/empty-explore-open";
import { EmptyGroupFitVisual } from "@/assets/empty-state/empty-group-fit";
import { EmptyHomeGroupsVisual } from "@/assets/empty-state/empty-home-groups";
import { EmptyHomePlansVisual } from "@/assets/empty-state/empty-home-plans";
import { EmptyInterestSearchVisual } from "@/assets/empty-state/empty-interest-search";
import { EmptyInviteCandidatesVisual } from "@/assets/empty-state/empty-invite-candidates";
import { EmptyMessageThreadVisual } from "@/assets/empty-state/empty-message-thread";
import { EmptyNotificationsVisual } from "@/assets/empty-state/empty-notifications";
import { EmptyProfileActivityLanesVisual } from "@/assets/empty-state/empty-profile-activity-lanes";
import { EmptyRecentActivityVisual } from "@/assets/empty-state/empty-recent-activity";
import { EmptyRecommendationsVisual } from "@/assets/empty-state/empty-recommendations";
import { EmptySettingsBlockedUsersVisual } from "@/assets/empty-state/empty-settings-blocked-users";
import { EmptyTraitMapVisual } from "@/assets/empty-state/empty-trait-map";
import { GroupAvatarPlaceholderVisual } from "@/assets/empty-state/group-avatar-placeholder";
import { PlanArtworkPendingVisual } from "@/assets/empty-state/plan-artwork-pending";
import { ErrorAuthLinkVisual } from "@/assets/error-state/error-auth-link";
import { ErrorForgeGroupFailedVisual } from "@/assets/error-state/error-forge-group-failed";
import { ErrorInviteSendFailedVisual } from "@/assets/error-state/error-invite-send-failed";
import { ErrorLinkPreviewUnavailableVisual } from "@/assets/error-state/error-link-preview-unavailable";
import { ErrorMediaImageUnavailableVisual } from "@/assets/error-state/error-media-image-unavailable";
import { ErrorMediaVideoUnavailableVisual } from "@/assets/error-state/error-media-video-unavailable";
import { ErrorMessageSendFailedVisual } from "@/assets/error-state/error-message-send-failed";
import { ErrorNetworkRetryVisual } from "@/assets/error-state/error-network-retry";
import { ErrorOnboardingCatalogVisual } from "@/assets/error-state/error-onboarding-catalog";
import { ErrorPageDataLoadVisual } from "@/assets/error-state/error-page-data-load";
import { ErrorProfileSaveVisual } from "@/assets/error-state/error-profile-save";
import { ErrorRouteLoadVisual } from "@/assets/error-state/error-route-load";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type StateKind = "empty" | "error";

type VisualRenderer = (props: {
  className: string;
  title: string;
}) => ReactNode;

type VisualStateShowcaseItem = {
  action?: string;
  description: string;
  id: string;
  kind: StateKind;
  secondaryAction?: string;
  surface: string;
  title: string;
  usage: string;
  visual: VisualRenderer;
  visualClassName?: string;
};

const emptyStateItems: VisualStateShowcaseItem[] = [
  {
    id: "empty-conversations",
    kind: "empty",
    surface: "Activity",
    title: "No conversations yet",
    description: "Browse open groups or forge one around your own plan.",
    action: "Browse groups",
    secondaryAction: "Forge a group",
    usage: "Conversation list",
    visual: (props) => <EmptyConversationsVisual {...props} />,
  },
  {
    id: "empty-conversations-filtered",
    kind: "empty",
    surface: "Activity",
    title: "No groups found",
    description: "Browse open groups to find a conversation worth joining.",
    action: "Browse groups",
    usage: "Conversation search",
    visual: (props) => <EmptyConversationsFilteredVisual {...props} />,
  },
  {
    id: "activity-no-conversation-selected",
    kind: "empty",
    surface: "Activity",
    title: "Pick a conversation to begin.",
    description:
      "Select any group or direct message from the list to start chatting and planning activities together.",
    usage: "Conversation stage",
    visual: (props) => <ActivityNoConversationSelectedVisual {...props} />,
    visualClassName: "w-56",
  },
  {
    id: "empty-message-thread",
    kind: "empty",
    surface: "Activity",
    title: "No messages yet",
    description:
      "Start with a simple hello or share the plan details with the group.",
    action: "Send message",
    usage: "Message thread",
    visual: (props) => <EmptyMessageThreadVisual {...props} />,
  },
  {
    id: "empty-notifications",
    kind: "empty",
    surface: "Notifications",
    title: "You're all caught up.",
    description:
      "Invites, replies, and group updates will show up here when there's something to act on.",
    usage: "Notification drawer",
    visual: (props) => <EmptyNotificationsVisual {...props} />,
  },
  {
    id: "empty-home-groups",
    kind: "empty",
    surface: "Home",
    title: "No groups yet.",
    description:
      "Forge your first group or browse open ones when you are ready.",
    action: "Forge a group",
    secondaryAction: "Browse groups",
    usage: "Groups grid",
    visual: (props) => <EmptyHomeGroupsVisual {...props} />,
  },
  {
    id: "empty-home-plans",
    kind: "empty",
    surface: "Home",
    title: "No plans yet",
    description:
      "Plans you create or join will appear here with the next useful step.",
    action: "Forge a plan",
    usage: "Upcoming plans",
    visual: (props) => <EmptyHomePlansVisual {...props} />,
  },
  {
    id: "empty-recommendations",
    kind: "empty",
    surface: "Home",
    title: "No strong openings yet.",
    description:
      "TeamForge will surface better group suggestions once there is more activity around you.",
    action: "Browse explore",
    usage: "Recommended groups",
    visual: (props) => <EmptyRecommendationsVisual {...props} />,
  },
  {
    id: "empty-explore-open",
    kind: "empty",
    surface: "Explore",
    title: "No open groups yet",
    description:
      "The explore feed is quiet right now. Try forging a group around your own plan.",
    action: "Forge a group",
    usage: "Open groups feed",
    visual: (props) => <EmptyExploreOpenVisual {...props} />,
  },
  {
    id: "empty-explore-filtered",
    kind: "empty",
    surface: "Explore",
    title: "No groups match these filters",
    description:
      "Loosen the filters or try a different interest to reveal more openings.",
    action: "Reset filters",
    usage: "Filtered explore feed",
    visual: (props) => <EmptyExploreFilteredVisual {...props} />,
  },
  {
    id: "empty-invite-candidates",
    kind: "empty",
    surface: "Forge",
    title: "No invite candidates yet",
    description:
      "Try widening the invite search or add people after the group is ready.",
    action: "Adjust filters",
    usage: "Invite candidates",
    visual: (props) => <EmptyInviteCandidatesVisual {...props} />,
  },
  {
    id: "plan-artwork-pending",
    kind: "empty",
    surface: "Forge",
    title: "Plan artwork pending",
    description:
      "Add a title, place, or activity cue so TeamForge can shape the plan card.",
    action: "Add plan details",
    usage: "Plan card artwork",
    visual: (props) => <PlanArtworkPendingVisual {...props} />,
  },
  {
    id: "group-avatar-placeholder",
    kind: "empty",
    surface: "Forge",
    title: "Group identity pending",
    description: "Pick a name and avatar once the group shape feels right.",
    action: "Customize group",
    usage: "Group avatar slot",
    visual: (props) => <GroupAvatarPlaceholderVisual {...props} />,
  },
  {
    id: "empty-recent-activity",
    kind: "empty",
    surface: "Forge",
    title: "No recent activity yet",
    description:
      "New profile edits, forge attempts, and group updates will collect here.",
    usage: "Recent activity",
    visual: (props) => <EmptyRecentActivityVisual {...props} />,
  },
  {
    id: "empty-group-fit",
    kind: "empty",
    surface: "Profile",
    title: "Fit still forming",
    description:
      "TeamForge needs a little more profile detail before it can describe the social fit with confidence.",
    action: "Add profile detail",
    usage: "Group fit section",
    visual: (props) => <EmptyGroupFitVisual {...props} />,
  },
  {
    id: "empty-trait-map",
    kind: "empty",
    surface: "Profile",
    title: "Trait map is still forming",
    description: "Finish personality setup to unlock OCEAN trait dimensions.",
    action: "Finish setup",
    usage: "Trait map sidebar",
    visual: (props) => <EmptyTraitMapVisual {...props} />,
  },
  {
    id: "empty-profile-activity-lanes",
    kind: "empty",
    surface: "Profile",
    title: "No activity lanes yet",
    description:
      "Add a few interests and TeamForge can turn them into activity lanes.",
    action: "Add interests",
    usage: "Activity lanes",
    visual: (props) => <EmptyProfileActivityLanesVisual {...props} />,
  },
  {
    id: "empty-interest-search",
    kind: "empty",
    surface: "Onboarding",
    title: "No interests found",
    description:
      "Try a broader word or add interests from the categories below.",
    action: "Clear search",
    usage: "Interest search",
    visual: (props) => <EmptyInterestSearchVisual {...props} />,
  },
  {
    id: "empty-active-sessions",
    kind: "empty",
    surface: "Settings",
    title: "No other active sessions",
    description: "New sign-ins on other devices will appear here.",
    usage: "Active sessions",
    visual: (props) => <EmptyActiveSessionsVisual {...props} />,
  },
  {
    id: "empty-settings-blocked-users",
    kind: "empty",
    surface: "Settings",
    title: "No blocked users",
    description:
      "People you block will be listed here so you can review them later.",
    usage: "Blocked users",
    visual: (props) => <EmptySettingsBlockedUsersVisual {...props} />,
  },
];

const errorStateItems: VisualStateShowcaseItem[] = [
  {
    id: "error-auth-link",
    kind: "error",
    surface: "Auth",
    title: "This link no longer works",
    description: "Request a fresh link and use it from the same browser.",
    action: "Request new link",
    secondaryAction: "Back to sign in",
    usage: "Activation and reset links",
    visual: (props) => <ErrorAuthLinkVisual {...props} />,
  },
  {
    id: "error-forge-group-failed",
    kind: "error",
    surface: "Forge",
    title: "We could not form a group",
    description: "There were not enough right openings for this plan yet.",
    action: "Try again",
    secondaryAction: "Adjust plan",
    usage: "Forge failed result",
    visual: (props) => <ErrorForgeGroupFailedVisual {...props} />,
  },
  {
    id: "error-invite-send-failed",
    kind: "error",
    surface: "Activity",
    title: "Invite did not send",
    description:
      "Check the recipient and try again when the connection settles.",
    action: "Try again",
    usage: "Invite dialog",
    visual: (props) => <ErrorInviteSendFailedVisual {...props} />,
  },
  {
    id: "error-link-preview-unavailable",
    kind: "error",
    surface: "Activity",
    title: "Preview unavailable",
    description:
      "The link still works, but TeamForge could not load its preview.",
    secondaryAction: "Open link",
    usage: "Link preview",
    visual: (props) => <ErrorLinkPreviewUnavailableVisual {...props} />,
  },
  {
    id: "error-media-image-unavailable",
    kind: "error",
    surface: "Activity",
    title: "Image could not load",
    description:
      "The file may have moved or the network dropped while loading it.",
    action: "Retry image",
    usage: "Image attachment",
    visual: (props) => <ErrorMediaImageUnavailableVisual {...props} />,
  },
  {
    id: "error-media-video-unavailable",
    kind: "error",
    surface: "Activity",
    title: "Video could not load",
    description: "Try again or open the attachment in a new tab.",
    action: "Retry video",
    usage: "Video attachment",
    visual: (props) => <ErrorMediaVideoUnavailableVisual {...props} />,
  },
  {
    id: "error-message-send-failed",
    kind: "error",
    surface: "Activity",
    title: "Message did not send",
    description: "Keep the draft, check your connection, and send it again.",
    action: "Retry send",
    usage: "Message composer",
    visual: (props) => <ErrorMessageSendFailedVisual {...props} />,
  },
  {
    id: "error-network-retry",
    kind: "error",
    surface: "Shared",
    title: "Connection slipped",
    description: "TeamForge could not reconnect. Try again in a moment.",
    action: "Try again",
    usage: "Network retry",
    visual: (props) => <ErrorNetworkRetryVisual {...props} />,
  },
  {
    id: "error-onboarding-catalog",
    kind: "error",
    surface: "Onboarding",
    title: "Interests could not load",
    description: "The onboarding catalog is unavailable right now.",
    action: "Retry catalog",
    usage: "Interest catalog",
    visual: (props) => <ErrorOnboardingCatalogVisual {...props} />,
  },
  {
    id: "error-page-data-load",
    kind: "error",
    surface: "Shared",
    title: "We could not load this page",
    description: "Refresh the page or come back once the data is available.",
    action: "Reload page",
    secondaryAction: "Back home",
    usage: "Page data boundary",
    visual: (props) => <ErrorPageDataLoadVisual {...props} />,
  },
  {
    id: "error-profile-save",
    kind: "error",
    surface: "Profile",
    title: "Profile did not save",
    description:
      "Your changes are still here. Try saving again when the connection settles.",
    action: "Save again",
    usage: "Profile save",
    visual: (props) => <ErrorProfileSaveVisual {...props} />,
  },
  {
    id: "error-route-load",
    kind: "error",
    surface: "Shared",
    title: "This route could not load",
    description:
      "The screen hit an unexpected issue before it finished opening.",
    action: "Retry route",
    secondaryAction: "Back home",
    usage: "Route error boundary",
    visual: (props) => <ErrorRouteLoadVisual {...props} />,
  },
];

const stateSections = [
  {
    id: "empty-states",
    title: "Empty States",
    description:
      "First-run, no-result, and missing-data states with activating copy.",
    items: emptyStateItems,
  },
  {
    id: "error-states",
    title: "Error States",
    description:
      "Recoverable failures with honest copy and one clear next step.",
    items: errorStateItems,
  },
];

const noop = () => undefined;

export function VisualStatesPage() {
  const totalStateCount = emptyStateItems.length + errorStateItems.length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 border-border border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-3">
            <p className="font-bold text-forge-teal text-sm uppercase tracking-wide">
              Visual QA
            </p>
            <h1 className="font-black text-4xl text-foreground tracking-normal sm:text-5xl">
              Empty and error states
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
              A single review wall for every TeamForge state visual, paired with
              the copy and controls that should appear beside it.
            </p>
          </div>

          <dl className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Metric label="Empty" value={emptyStateItems.length} />
            <Metric label="Error" value={errorStateItems.length} />
            <Metric label="Total" value={totalStateCount} />
          </dl>
        </header>

        {stateSections.map((section) => (
          <section
            aria-labelledby={`${section.id}-title`}
            className="flex flex-col gap-5"
            key={section.id}
          >
            <div className="flex flex-col gap-1">
              <h2
                className="font-black text-2xl text-foreground tracking-normal"
                id={`${section.id}-title`}
              >
                {section.title}
              </h2>
              <p className="text-muted-foreground">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {section.items.map((item) => (
                <VisualStateCard item={item} key={item.id} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-24 flex-col gap-1 border-border border-r px-4 py-3 last:border-r-0">
      <dt className="font-bold text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </dt>
      <dd className="font-black text-2xl text-foreground">{value}</dd>
    </div>
  );
}

function VisualStateCard({ item }: { item: VisualStateShowcaseItem }) {
  const titleId = `${item.id}-title`;
  const isError = item.kind === "error";

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-border border-b px-5 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-bold text-xs uppercase tracking-wide",
                isError
                  ? "bg-spark-amber/14 text-spark-amber"
                  : "bg-forge-teal/12 text-forge-teal",
              )}
            >
              {item.surface}
            </span>
            <span className="text-muted-foreground text-sm">{item.usage}</span>
          </div>
          <p className="font-mono text-muted-foreground text-xs">{item.id}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center bg-background px-5 py-8 text-foreground">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 text-center">
          <div className="flex h-44 w-full items-center justify-center">
            {item.visual({
              className: cn(
                "h-auto max-h-40 w-48 text-current sm:w-56",
                item.visualClassName,
              ),
              title: `${item.title} illustration`,
            })}
          </div>

          <div className="flex max-w-md flex-col items-center gap-2">
            <h3 className="font-black text-2xl text-current" id={titleId}>
              {item.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>

          {(item.action || item.secondaryAction) && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {item.secondaryAction && (
                <Button onClick={noop} size="sm" variant="outline">
                  <span>{item.secondaryAction}</span>
                </Button>
              )}
              {item.action && (
                <Button
                  onClick={noop}
                  size="sm"
                  variant={isError ? "secondary" : "primary"}
                >
                  {isError ? (
                    <RefreshCcw aria-hidden="true" className="size-4" />
                  ) : (
                    <ArrowRight aria-hidden="true" className="size-4" />
                  )}
                  <span>{item.action}</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
