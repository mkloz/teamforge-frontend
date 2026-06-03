import { Check, X } from "lucide-react";

import type { Group } from "@/features/activity/lib/activity-contract";
import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import {
  getPlanCoverPreset,
  PLAN_COVER_PRESETS,
  type PlanCoverPreset,
} from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";

import type { GroupIdentityUploadSectionProps } from "./edit-group-identity-dialog.types";

interface EditGroupCoverSectionProps extends GroupIdentityUploadSectionProps {
  group: Group;
}

export function EditGroupCoverSection({
  editor,
  group,
  inputRef,
}: EditGroupCoverSectionProps) {
  const activeCoverPreset = getPlanCoverPreset(editor.coverImage);

  if (!group.plan) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-semibold text-muted-foreground text-xs">Plan cover</p>
      <div className="relative">
        <FileDropzone
          inputRef={inputRef}
          variant="cover"
          accept="image/*"
          title={editor.coverImage ? "Change cover" : "Upload cover"}
          description="Drop a plan image here or browse from your device."
          helper="PNG, JPG, WEBP up to 30 MB"
          actionLabel="Browse"
          disabled={!editor.isOnline}
          isUploading={editor.isCoverUploading}
          error={editor.coverUploadError}
          onFiles={editor.handleCoverFiles}
          preview={
            <div className="size-full">
              <PlanCover
                value={editor.coverImage}
                alt={`${group.name} cover preview`}
                imageClassName="transition-transform duration-500"
              />
            </div>
          }
        />
        {editor.coverImage && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2 z-20 rounded-full bg-ink/45 text-canvas hover:bg-ink/65"
            disabled={!editor.isOnline}
            title={
              editor.isOnline
                ? undefined
                : "Reconnect before changing group images."
            }
            onClick={() => editor.setCoverImage(null)}
            aria-label="Remove cover"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {PLAN_COVER_PRESETS.map((preset) => (
          <PlanCoverPresetButton
            key={preset.id}
            preset={preset}
            selected={editor.coverImage === preset.id}
            disabled={!editor.isOnline}
            onToggle={() =>
              editor.setCoverImage(
                editor.coverImage === preset.id ? null : preset.id,
              )
            }
          />
        ))}
      </div>
      {activeCoverPreset && (
        <p className="font-medium text-muted-foreground text-xs">
          Selected: {activeCoverPreset.label}
        </p>
      )}
    </div>
  );
}

interface PlanCoverPresetButtonProps {
  preset: PlanCoverPreset;
  disabled?: boolean;
  onToggle: () => void;
  selected: boolean;
}

function PlanCoverPresetButton({
  disabled = false,
  onToggle,
  preset,
  selected,
}: PlanCoverPresetButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled}
      title={disabled ? "Reconnect before changing group images." : undefined}
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "group relative h-14 overflow-hidden rounded-lg border-2 p-0 transition duration-200",
        preset.kind === "gradient" && `bg-linear-to-br ${preset.gradient}`,
        selected
          ? "border-forge-teal shadow-forge-teal/20 shadow-md"
          : "border-transparent hover:scale-105 hover:shadow-sm",
      )}
    >
      {preset.kind === "image" && (
        <img
          src={preset.src}
          alt=""
          className="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      )}
      <span className="absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-black/55" />
      <span className="absolute bottom-1 left-1.5 font-bold text-white/85 text-xs drop-shadow-sm">
        {preset.label}
      </span>
      {selected && (
        <IconTile
          icon={Check}
          iconClassName="size-2.5"
          size="xs"
          shape="circle"
          tone="none"
          className="absolute top-1 right-1 bg-white/95 text-forge-teal shadow-sm"
        />
      )}
    </Button>
  );
}
