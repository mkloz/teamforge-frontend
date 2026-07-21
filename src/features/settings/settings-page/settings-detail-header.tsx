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
  label: "Settings",
  summary: "Keep your account preferences clear and current.",
} satisfies SettingsDetailHeaderContent;

interface SettingsDetailHeaderContent {
  headline: string;
  label: string;
  summary: string;
}

export function SettingsDetailHeader({
  activeSectionMeta,
  mobileBackButtonRef,
  onMobileBack,
}: SettingsDetailHeaderProps) {
  const content = getSettingsDetailHeaderContent(activeSectionMeta);

  return (
    <div className="mb-7 border-border border-b pb-5 lg:mb-9 lg:pb-7">
      <div className="fixed inset-x-0 top-0 z-50 border-border border-b bg-canvas px-4 py-2 lg:hidden">
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
          <p className="font-semibold text-slate-muted text-xs">
            {content.label}
          </p>
          <h1 className="mt-2 font-bold text-2xl text-ink leading-tight lg:hidden">
            {content.headline}
          </h1>
          <h2 className="mt-2 hidden font-bold text-3xl text-ink leading-tight lg:block">
            {content.headline}
          </h2>
          <p className="mt-3 max-w-2xl text-slate-muted text-sm leading-relaxed">
            {content.summary}
          </p>
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
    headline: activeSectionMeta.headline,
    label: activeSectionMeta.label,
    summary: activeSectionMeta.summary,
  };
}
