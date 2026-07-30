import { ChevronLeft } from "lucide-react";
import type { Ref } from "react";

import { Button } from "@/shared/components/ui/button";

import type { SettingsSectionMeta } from "./types";

interface SettingsDetailHeaderProps {
  activeSectionMeta: SettingsSectionMeta | null;
  mobileBackButtonRef: Ref<HTMLButtonElement>;
  onMobileBack: () => void;
}

const SETTINGS_DETAIL_HEADER_FALLBACK = {
  headline: "Manage your account",
} satisfies SettingsDetailHeaderContent;

interface SettingsDetailHeaderContent {
  description?: string;
  headline: string;
}

export function SettingsDetailHeader({
  activeSectionMeta,
  mobileBackButtonRef,
  onMobileBack,
}: SettingsDetailHeaderProps) {
  const content = getSettingsDetailHeaderContent(activeSectionMeta);

  return (
    <div className="mb-7 lg:mb-8">
      <div className="fixed inset-x-0 top-0 z-50 border-border border-b bg-canvas px-3 py-2 sm:px-4 lg:hidden">
        <Button
          ref={mobileBackButtonRef}
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 px-2 text-slate-muted"
          onClick={onMobileBack}
        >
          <ChevronLeft size={16} />
          Settings
        </Button>
      </div>
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <h1 className="font-bold text-2xl text-ink leading-tight lg:hidden">
            {content.headline}
          </h1>
          <h2 className="hidden font-bold text-3xl text-ink leading-tight lg:block">
            {content.headline}
          </h2>
          {content.description ? (
            <p className="mt-2 max-w-2xl text-slate-muted text-sm leading-relaxed">
              {content.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getSettingsDetailHeaderContent(
  activeSectionMeta: SettingsSectionMeta | null,
): SettingsDetailHeaderContent {
  if (!activeSectionMeta) {
    return SETTINGS_DETAIL_HEADER_FALLBACK;
  }

  return {
    description: activeSectionMeta.description,
    headline: activeSectionMeta.headline,
  };
}
