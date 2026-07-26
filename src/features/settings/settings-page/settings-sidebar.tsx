import { Link } from "@tanstack/react-router";
import { ChevronRight, LogOut } from "lucide-react";
import { lazy, type MouseEvent, type Ref, Suspense, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";
import {
  buildSettingsNavigation,
  type SettingsSection,
} from "@/shared/navigation/settings-navigation";

import { SETTINGS_SECTIONS } from "./settings-sections";

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

type SettingsSectionItem = (typeof SETTINGS_SECTIONS)[number];

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
      <div className="lg:fixed lg:top-10 lg:max-h-[calc(100svh-5rem)] lg:w-72 lg:overflow-y-auto lg:pr-1">
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
    <div className="mt-5 border-border border-y py-1 lg:border-x-0 lg:border-t lg:border-b-0 lg:py-4">
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
        title="Sign out of TeamForge?"
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
    <nav
      aria-label="Settings sections"
      className="flex flex-col overflow-hidden"
    >
      {SETTINGS_SECTIONS.map((section) => (
        <SettingsSectionNavLink
          key={section.id}
          activeSection={activeSection}
          activeSectionLinkRef={activeSectionLinkRef}
          section={section}
          onSectionSelect={onSectionSelect}
        />
      ))}
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
      className={getSettingsSectionClassName(isActive)}
    >
      <IconTile
        icon={Icon}
        tone={isActive ? "teal" : "none"}
        size="md"
        shape="circle"
        className={getSettingsSectionIconClassName(isActive)}
      />
      <span className="min-w-0 flex-1">
        <span className={getSettingsSectionLabelClassName(isActive)}>
          {section.label}
        </span>
      </span>
      <ChevronRight
        size={16}
        className="shrink-0 text-slate-muted/60 transition-colors group-hover:text-slate-muted lg:hidden"
        aria-hidden="true"
      />
    </Link>
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

function getSettingsSectionClassName(isActive: boolean) {
  return cn(
    // oxlint-disable-next-line tailwindcss/consistent-variant-order -- Preserve this pre-existing class string in a behavior-only refactor.
    "group relative flex w-full items-center justify-between gap-3 border-border border-b px-1 py-2 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:bg-muted/40 lg:items-start lg:border-b-0 lg:px-4 lg:active:bg-transparent",
    "after:absolute after:top-2.5 after:bottom-2.5 after:left-0 after:w-0.5 after:origin-center after:scale-y-0 after:bg-primary after:transition-transform",
    isActive
      ? "text-ink lg:after:scale-y-100"
      : "text-slate-muted hover:text-ink",
  );
}

function getSettingsSectionIconClassName(isActive: boolean) {
  return cn(
    "transition-colors",
    isActive ? "bg-primary/8" : "text-slate-muted group-hover:text-ink",
  );
}

function getSettingsSectionLabelClassName(isActive: boolean) {
  return cn(
    "block font-semibold text-base leading-snug lg:text-sm",
    isActive ? "text-ink" : "text-inherit",
  );
}
