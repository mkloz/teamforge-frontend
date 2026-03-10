"use client";

import { useHomeFeed } from "./hooks/use-home-feed";
import { useSearchMode } from "./hooks/use-search-mode";
import { useForgeLimits } from "./hooks/use-forge-limits";
import { usePendingInvitations } from "./hooks/use-pending-invitations";
import { GreetingBanner } from "./components/greeting-banner";
import { ForgeWidget } from "./components/forge-widget";
import { PendingInvitationsBar } from "./components/pending-invitations-bar";
import { ActiveGroupsRow } from "./components/active-groups-row";
import { ActivityFeed } from "./components/activity-feed";
import { PersonalizedTemplates } from "./components/personalized-templates";
import type { PersonalizedTemplate } from "./types/home.types";

export function HomePage() {
  const { data: feed, isLoading, error } = useHomeFeed();
  const {
    isUpdating: isSearchUpdating,
    toggleSearchMode,
  } = useSearchMode(feed?.user.searchStatus || "IDLE");
  const { remaining, isExhausted } = useForgeLimits(
    feed?.forgeLimits || { used: 0, limit: 3, resetsAt: new Date().toISOString() },
  );
  const {
    invitations,
    isUpdating: isInvUpdating,
    acceptInvitation,
    declineInvitation,
  } = usePendingInvitations(feed?.invitations || []);

  const handleForgeClick = () => {
    // TODO: Open Forge Flow overlay
  };

  const handleSelectTemplate = (template: PersonalizedTemplate) => {
    // TODO: Open activity creation flow
  };

  if (isLoading) {
    return (
      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          <div className="h-24 bg-muted animate-pulse rounded-2xl" />
          <div className="h-32 bg-muted animate-pulse rounded-2xl lg:hidden" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
        <div className="hidden lg:block w-72 shrink-0 space-y-4">
          <div className="h-48 bg-muted animate-pulse rounded-2xl" />
          <div className="h-32 bg-muted animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/30">
        <p className="text-destructive font-semibold">Failed to load homepage</p>
        <p className="text-sm text-destructive/80">
          Please refresh the page to try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Main content column */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Greeting Banner */}
        <GreetingBanner
          user={feed.user}
          onSearchModeToggle={toggleSearchMode}
          isUpdating={isSearchUpdating}
        />

        {/* Forge Widget - mobile/tablet only (inline variant) */}
        <div className="lg:hidden">
          <ForgeWidget
            limits={feed.forgeLimits}
            isExhausted={isExhausted}
            remaining={remaining}
            onForgeClick={handleForgeClick}
            variant="inline"
          />
        </div>

        {/* Pending Invitations */}
        <PendingInvitationsBar
          invitations={invitations}
          isUpdating={isInvUpdating}
          onAccept={acceptInvitation}
          onDecline={declineInvitation}
        />

        {/* Active Groups Row */}
        <ActiveGroupsRow groups={feed.groups} />

        {/* Activity Feed */}
        <ActivityFeed activities={feed.activities} />

        {/* Personalized Templates */}
        <PersonalizedTemplates
          templates={feed.templates}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>

      {/* Right sidebar - desktop only */}
      <aside className="hidden lg:block w-72 shrink-0 space-y-4">
        {/* Forge Widget */}
        <div className="sticky top-20">
          <ForgeWidget
            limits={feed.forgeLimits}
            isExhausted={isExhausted}
            remaining={remaining}
            onForgeClick={handleForgeClick}
            variant="sidebar"
          />

          {/* Quick stats card */}
          <div className="mt-4 p-4 rounded-2xl bg-card border border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Your Activity
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active groups</span>
                <span className="text-sm font-semibold text-foreground">
                  {feed.groups.filter((g) => g.status === "ACTIVE").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending invites</span>
                <span className="text-sm font-semibold text-foreground">
                  {invitations.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trust score</span>
                <span className="text-sm font-semibold text-primary">
                  {Math.round(feed.user.trustScore * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
