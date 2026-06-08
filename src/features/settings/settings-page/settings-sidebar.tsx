import { Link } from "@tanstack/react-router";
import { ChevronRight, LogOut } from "lucide-react";
import { lazy, Suspense, useState } from "react";

import {
  buildSettingsNavigation,
  type SettingsSection,
} from "@/features/settings/lib/settings-route";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

import { SETTINGS_SECTIONS } from "./settings-sections";

const ActionDialog = lazy(() =>
  import("@/shared/components/ui/action-dialog").then((module) => ({
    default: module.ActionDialog,
  })),
);

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  isMobileDetailOpen: boolean;
  isSigningOut: boolean;
  onSectionSelect: (section: SettingsSection) => void;
  onSignOut: () => Promise<void> | void;
}

export function SettingsSidebar({
  activeSection,
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
          <p className="mt-2 text-slate-muted text-sm leading-relaxed">
            The parts of TeamForge that should bend around you.
          </p>
        </div>

        <SettingsSectionNav
          activeSection={activeSection}
          onSectionSelect={onSectionSelect}
        />

        <div className="mt-5 border-border border-y py-1 lg:border-x-0 lg:border-t lg:border-b-0 lg:py-4">
          <Button
            type="button"
            variant="destructive"
            className="h-auto w-full justify-start px-1 py-3 lg:px-4"
            disabled={isSigningOut}
            onClick={() => setSignOutDialogOpen(true)}
          >
            <LogOut size={16} />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>

          {signOutDialogOpen ? (
            <Suspense fallback={null}>
              <ActionDialog
                cancelLabel="Stay signed in"
                confirmLabel={isSigningOut ? "Signing out..." : "Sign out"}
                description="This ends the current session and returns you to the login screen."
                details={[
                  "You can come back with the same email and password.",
                ]}
                loading={isSigningOut}
                onConfirm={onSignOut}
                onOpenChange={setSignOutDialogOpen}
                open={signOutDialogOpen}
                title="Sign out of TeamForge?"
                tone="warning"
              />
            </Suspense>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

interface SettingsSectionNavProps {
  activeSection: SettingsSection;
  onSectionSelect: (section: SettingsSection) => void;
}

function SettingsSectionNav({
  activeSection,
  onSectionSelect,
}: SettingsSectionNavProps) {
  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-col overflow-hidden"
    >
      {SETTINGS_SECTIONS.map((section) => {
        const isActive = activeSection === section.id;
        const Icon = section.icon;

        return (
          <Link
            key={section.id}
            {...buildSettingsNavigation(section.id)}
            onClick={(event) => {
              if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.altKey ||
                event.ctrlKey ||
                event.shiftKey
              ) {
                return;
              }

              onSectionSelect(section.id);
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex w-full items-center justify-between gap-3 border-border border-b px-1 py-2 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:bg-muted/40 lg:items-start lg:border-b-0 lg:px-4 active:lg:bg-transparent",
              "after:absolute after:top-2.5 after:bottom-2.5 after:left-0 after:w-0.5 after:origin-center after:scale-y-0 after:bg-primary after:transition-transform",
              isActive
                ? "text-ink lg:after:scale-y-100"
                : "text-slate-muted hover:text-ink",
            )}
          >
            <IconTile
              icon={Icon}
              tone={isActive ? "teal" : "none"}
              size="md"
              shape="circle"
              className={cn(
                "transition-colors",
                isActive
                  ? "bg-primary/8"
                  : "text-slate-muted group-hover:text-ink",
              )}
            />
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block font-semibold text-base leading-snug lg:text-sm",
                  isActive ? "text-ink" : "text-inherit",
                )}
              >
                {section.label}
              </span>
              <span
                className={cn(
                  "mt-1 block text-xs leading-snug",
                  isActive ? "text-slate-muted" : "text-slate-muted/85",
                )}
              >
                {section.description}
              </span>
            </span>
            <ChevronRight
              size={16}
              className="shrink-0 text-slate-muted/60 transition-colors group-hover:text-slate-muted lg:hidden"
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </nav>
  );
}
