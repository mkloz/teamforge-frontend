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
    <div className="mb-7 border-border border-b pb-5 lg:mb-9 lg:pb-7">
      <div className="fixed inset-x-0 top-0 z-50 border-border border-b bg-canvas px-4 py-2 lg:hidden">
        <Button
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
          <p className="font-semibold text-slate-muted text-xs uppercase tracking-widest">
            {activeSectionMeta?.label ?? "Settings"}
          </p>
          <h2 className="mt-2 font-bold text-2xl text-ink leading-tight lg:text-3xl">
            {activeSectionMeta?.headline ?? "Manage your account"}
          </h2>
          <p className="mt-3 max-w-2xl text-slate-muted text-sm leading-relaxed">
            {activeSectionMeta?.summary ??
              "Keep your account preferences clear and current."}
          </p>
        </div>
      </div>
    </div>
  );
}
