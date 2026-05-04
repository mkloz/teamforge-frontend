import { ChevronLeft } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import type { SettingsSectionMeta } from "./types";

interface SettingsDetailHeaderProps {
  activeSectionMeta: SettingsSectionMeta | null;
  onMobileBack: () => void;
}

export function SettingsDetailHeader({
  activeSectionMeta,
  onMobileBack,
}: SettingsDetailHeaderProps) {
  return (
    <div className="mb-7 border-b border-border pb-5 lg:mb-9 lg:pb-7">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-canvas px-4 py-2 lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 h-9 px-2 text-slate-muted"
          onClick={onMobileBack}
        >
          <ChevronLeft size={16} />
          Settings
        </Button>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-muted">
        {activeSectionMeta?.label ?? "Settings"}
      </p>
      <h2 className="mt-2 text-2xl font-bold leading-tight text-ink lg:text-3xl">
        {activeSectionMeta?.headline ?? "Manage your account"}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-muted">
        {activeSectionMeta?.summary ??
          "Keep your account preferences clear and current."}
      </p>
    </div>
  );
}
