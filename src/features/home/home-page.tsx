"use client";

import { useState } from "react";
import { useHomeFeed } from "./hooks/use-home-feed";
import { useSearchMode } from "./hooks/use-search-mode";
import { useForgeLimits } from "./hooks/use-forge-limits";
import { usePendingInvitations } from "./hooks/use-pending-invitations";
import { GreetingBanner } from "./components/greeting-banner";
import { ForgeHeroCard } from "./components/forge-hero-card";
import { PendingInvitationsBar } from "./components/pending-invitations-bar";
import { ActiveGroupsRow } from "./components/active-groups-row";
import { ActivityFeed } from "./components/activity-feed";
import { PersonalizedTemplates } from "./components/personalized-templates";
import type { PersonalizedTemplate } from "./types/home.types";

export function HomePage() {
  const { data: feed, isLoading, error } = useHomeFeed();
  const { searchStatus, isUpdating: isSearchUpdating, toggleSearchMode } = useSearchMode(
    feed?.user.searchStatus || "IDLE",
  );
  const { remaining, isExhausted } = useForgeLimits(feed?.forgeLimits || { used: 0, limit: 3, resetsAt: new Date().toISOString() });
  const { invitations, isUpdating: isInvUpdating, acceptInvitation, declineInvitation } = usePendingInvitations(feed?.invitations || []);

  const handleForgeClick = () => {
    // TODO: Open Forge Flow overlay
    console.log("[v0] Forge button clicked");
  };

  const handleSelectTemplate = (template: PersonalizedTemplate) => {
    // TODO: Open activity creation flow
    console.log("[v0] Template selected:", template.title);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/30">
        <p className="text-destructive font-semibold">Failed to load homepage</p>
        <p className="text-sm text-destructive/80">Please refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <GreetingBanner
        user={feed.user}
        onSearchModeToggle={toggleSearchMode}
        isUpdating={isSearchUpdating}
      />

      {/* Forge Hero Card */}
      <ForgeHeroCard
        limits={feed.forgeLimits}
        isExhausted={isExhausted}
        remaining={remaining}
        onForgeClick={handleForgeClick}
      />

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
  );
}

