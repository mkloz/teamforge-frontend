import { ChevronRight, LogOut } from "lucide-react";

import type { SettingsSection } from "@/features/settings/lib/settings-route";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { SETTINGS_SECTIONS } from "./settings-sections";

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  isMobileDetailOpen: boolean;
  isSigningOut: boolean;
  onSectionSelect: (section: SettingsSection) => void;
  onSignOut: () => void;
}

export function SettingsSidebar({
  activeSection,
  isMobileDetailOpen,
  isSigningOut,
  onSectionSelect,
  onSignOut,
}: SettingsSidebarProps) {
  return (
    <aside
      className={cn(
        "lg:sticky lg:top-10 lg:block lg:self-start",
        isMobileDetailOpen && "hidden",
      )}
    >
      <div className="mb-5 border-b border-border pb-5 lg:border-b-0 lg:pb-0">
        <h1 className="text-2xl leading-tight font-bold text-ink lg:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-muted">
          The parts of TeamForge that should bend around you.
        </p>
      </div>

      <SettingsSectionNav
        activeSection={activeSection}
        onSectionSelect={onSectionSelect}
      />

      <div className="mt-5 border-y border-border py-1 lg:border-x-0 lg:border-t lg:border-b-0 lg:py-4">
        <Button
          type="button"
          variant="destructive"
          className="h-auto w-full justify-start rounded-lg px-1 py-3 lg:px-4"
          disabled={isSigningOut}
          onClick={() => {
            void onSignOut();
          }}
        >
          <LogOut size={16} />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Button>
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
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionSelect(section.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex w-full items-center justify-between gap-3 border-b border-border px-1 py-2 text-left transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:ring-forge-teal/30 focus-visible:outline-none active:bg-muted/40 lg:items-start lg:border-b-0 lg:px-4 lg:py-2 lg:active:bg-transparent",
              "after:absolute after:top-2.5 after:bottom-2.5 after:left-0 after:w-0.5 after:origin-center after:scale-y-0 after:bg-forge-teal after:transition-transform",
              isActive
                ? "text-ink lg:after:scale-y-100"
                : "text-slate-muted hover:text-ink",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                isActive
                  ? "bg-forge-teal/8 text-forge-teal"
                  : "text-slate-muted group-hover:text-ink",
              )}
            >
              <Icon size={16} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-base leading-snug font-semibold lg:text-sm",
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
          </button>
        );
      })}
    </nav>
  );
}
