import { Check, X } from "lucide-react";

import type { Group } from "@/features/activity/lib/activity-contract";
import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import {
  getPlanCoverPreset,
  PLAN_COVER_PRESETS,
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
      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
        Plan cover
      </p>
      <div className="relative">
        <FileDropzone
          inputRef={inputRef}
          variant="cover"
          accept="image/*"
          title={editor.coverImage ? "Change cover" : "Upload cover"}
          description="Drop a plan image here or browse from your device."
          helper="PNG, JPG, WEBP up to 5 MB"
          actionLabel="Browse"
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
            className="absolute top-2 right-2 z-20 rounded-full bg-black/45 text-white hover:bg-black/65"
            onClick={() => editor.setCoverImage(null)}
            aria-label="Remove cover"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {PLAN_COVER_PRESETS.map(({ id, gradient, label }) => (
          <PlanCoverPresetButton
            key={id}
            gradient={gradient}
            label={label}
            selected={editor.coverImage === id}
            onToggle={() =>
              editor.setCoverImage(editor.coverImage === id ? null : id)
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
  gradient: string;
  label: string;
  onToggle: () => void;
  selected: boolean;
}

function PlanCoverPresetButton({
  gradient,
  label,
  onToggle,
  selected,
}: PlanCoverPresetButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "group relative h-14 overflow-hidden rounded-xl border-2 bg-linear-to-br p-0 transition duration-200",
        gradient,
        selected
          ? "border-forge-teal shadow-forge-teal/20 shadow-md"
          : "border-transparent hover:scale-105 hover:shadow-sm",
      )}
    >
      <span className="absolute bottom-1 left-1.5 font-bold text-white/85 text-xs drop-shadow-sm">
        {label}
      </span>
      {selected && (
        <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-white/95 shadow-sm">
          <Check size={9} className="text-forge-teal" strokeWidth={3} />
        </span>
      )}
    </Button>
  );
}
