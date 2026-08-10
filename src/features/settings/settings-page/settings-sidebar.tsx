import { Link } from "@tanstack/react-router";
import { ChevronRight, LogOut } from "lucide-react";
import { lazy, type MouseEvent, type Ref, Suspense, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
  GroupedMenuSection,
} from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";
import {
  buildSettingsNavigation,
  type SettingsSection,
} from "@/shared/navigation/settings-navigation";

import { SETTINGS_SECTION_GROUPS } from "./settings-sections";

const ActionDialog = lazy(() =>
  import("@/shared/components/ui/action-dialog").then((module) => ({
    default: module.ActionDialog,
  })),
);

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  activeSectionLinkRef: Ref<HTMLAnchorElement>;
  isMobileDetailOpen: boolean;
  isSigningOut: boolean;
  onSectionSelect: (section: SettingsSection) => void;
  onSignOut: () => Promise<void> | void;
}

type SettingsSectionItem =
  (typeof SETTINGS_SECTION_GROUPS)[number]["sections"][number];

export function SettingsSidebar({
  activeSection,
  activeSectionLinkRef,
  isMobileDetailOpen,
  isSigningOut,
  onSectionSelect,
  onSignOut,
}: SettingsSidebarProps) {
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  return (
    <aside className={cn("lg:block", isMobileDetailOpen && "hidden")}>
      <div className="lg:fixed lg:top-10 lg:max-h-[calc(100svh-5rem)] lg:w-60 lg:overflow-y-auto lg:pr-1">
        <div className="mb-5 border-border border-b pb-5 lg:border-b-0 lg:pb-0">
          <h1 className="font-bold text-2xl text-ink leading-tight lg:text-3xl">
            Settings
          </h1>
        </div>

        <SettingsSectionNav
          activeSection={activeSection}
          activeSectionLinkRef={activeSectionLinkRef}
          onSectionSelect={onSectionSelect}
        />

        <SettingsSignOutSection
          isSigningOut={isSigningOut}
          open={signOutDialogOpen}
          onOpenChange={setSignOutDialogOpen}
          onSignOut={onSignOut}
        />
      </div>
    </aside>
  );
}

function SettingsSignOutSection({
  isSigningOut,
  onOpenChange,
  onSignOut,
  open,
}: {
  isSigningOut: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => Promise<void> | void;
  open: boolean;
}) {
  const signOutLabel = getSignOutLabel(isSigningOut);

  return (
    <div className="mt-7">
      <Button
        type="button"
        variant="destructive"
        className="h-auto w-full justify-start px-1 py-3 lg:px-4"
        disabled={isSigningOut}
        onClick={() => onOpenChange(true)}
      >
        <LogOut size={16} />
        {signOutLabel}
      </Button>

      <SettingsSignOutDialog
        confirmLabel={signOutLabel}
        isSigningOut={isSigningOut}
        open={open}
        onOpenChange={onOpenChange}
        onSignOut={onSignOut}
      />
    </div>
  );
}

function SettingsSignOutDialog({
  confirmLabel,
  isSigningOut,
  onOpenChange,
  onSignOut,
  open,
}: {
  confirmLabel: string;
  isSigningOut: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => Promise<void> | void;
  open: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ActionDialog
        cancelLabel="Stay signed in"
        confirmLabel={confirmLabel}
        description="This ends the current session and returns you to the login screen."
        loading={isSigningOut}
        onConfirm={onSignOut}
        onOpenChange={onOpenChange}
        open={open}
        title="Sign out of Findafew?"
        tone="warning"
      />
    </Suspense>
  );
}

function getSignOutLabel(isSigningOut: boolean) {
  return isSigningOut ? "Signing out..." : "Sign out";
}

interface SettingsSectionNavProps {
  activeSection: SettingsSection;
  activeSectionLinkRef: Ref<HTMLAnchorElement>;
  onSectionSelect: (section: SettingsSection) => void;
}

function SettingsSectionNav({
  activeSection,
  activeSectionLinkRef,
  onSectionSelect,
}: SettingsSectionNavProps) {
  return (
    <nav aria-label="Settings sections" className="flex flex-col gap-9">
      {SETTINGS_SECTION_GROUPS.map((group) => {
        const headingId = `settings-section-group-${group.id}`;

        return (
          <GroupedMenuSection
            key={group.id}
            headingId={headingId}
            label={group.label}
          >
            <GroupedMenuList>
              {group.sections.map((section) => (
                <GroupedMenuItem key={section.id}>
                  <SettingsSectionNavLink
                    activeSection={activeSection}
                    activeSectionLinkRef={activeSectionLinkRef}
                    section={section}
                    onSectionSelect={onSectionSelect}
                  />
                </GroupedMenuItem>
              ))}
            </GroupedMenuList>
          </GroupedMenuSection>
        );
      })}
    </nav>
  );
}

function SettingsSectionNavLink({
  activeSection,
  activeSectionLinkRef,
  onSectionSelect,
  section,
}: {
  activeSection: SettingsSection;
  activeSectionLinkRef: Ref<HTMLAnchorElement>;
  onSectionSelect: (section: SettingsSection) => void;
  section: SettingsSectionItem;
}) {
  const isActive = activeSection === section.id;
  const Icon = section.icon;

  return (
    <GroupedMenuAction asChild selected={isActive}>
      <Link
        ref={isActive ? activeSectionLinkRef : undefined}
        {...buildSettingsNavigation(section.id)}
        onClick={(event) => {
          if (shouldIgnoreSettingsNavigationClick(event)) {
            return;
          }

          onSectionSelect(section.id);
        }}
        aria-current={isActive ? "page" : undefined}
      >
        <IconTile
          icon={Icon}
          tone="none"
          size="sm"
          shape="circle"
          className="text-current transition-colors"
        />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-sm leading-snug">
            {section.label}
          </span>
        </span>
        <ChevronRight
          size={16}
          className="shrink-0 text-slate-muted/60 transition-colors group-hover:text-slate-muted lg:hidden"
          aria-hidden="true"
        />
      </Link>
    </GroupedMenuAction>
  );
}

function shouldIgnoreSettingsNavigationClick(
  event: MouseEvent<HTMLAnchorElement>,
) {
  return [
    event.defaultPrevented,
    event.button !== 0,
    event.metaKey,
    event.altKey,
    event.ctrlKey,
    event.shiftKey,
  ].some(Boolean);
}
