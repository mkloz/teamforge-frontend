"use client";

import { GroupIdentityFields } from "@/features/forge/components/group-identity-fields";
import { cn } from "@/shared/lib/utils";
import { Check, ImagePlus, Upload, X } from "lucide-react";
import { useRef } from "react";

export interface Step5IdentityProps {
  planName: string;
  activity: string | null;
  coverImage: string | null;
  onCoverImageChange: (url: string | null) => void;
  avatarImage: string | null;
  onAvatarImageChange: (url: string | null) => void;
  groupName?: string;
  onGroupNameChange?: (v: string) => void;
  groupDescription?: string;
  onGroupDescriptionChange?: (v: string) => void;
}

// Refined presets — harmonious palette built on brand tokens:
// Teal family, Amber family, Slate, Rose, Forest, and Midnight.
// Each has a light-mode accessible label color.
const PRESET_COVERS: {
  id: string;
  gradient: string;
  label: string;
  labelColor: string;
}[] = [
  {
    id: "teal",
    gradient: "from-teal-500 to-teal-700",
    label: "Teal",
    labelColor: "text-teal-700",
  },
  {
    id: "ember",
    gradient: "from-amber-400 to-orange-500",
    label: "Ember",
    labelColor: "text-orange-700",
  },
  {
    id: "forest",
    gradient: "from-emerald-500 to-green-700",
    label: "Forest",
    labelColor: "text-emerald-700",
  },
  {
    id: "rose",
    gradient: "from-rose-400 to-rose-600",
    label: "Rose",
    labelColor: "text-rose-700",
  },
  {
    id: "midnight",
    gradient: "from-slate-700 to-slate-900",
    label: "Midnight",
    labelColor: "text-slate-600",
  },
  {
    id: "sky",
    gradient: "from-sky-400 to-blue-600",
    label: "Sky",
    labelColor: "text-blue-700",
  },
];

export function Step5Identity({
  planName,
  activity,
  coverImage,
  onCoverImageChange,
  avatarImage,
  onAvatarImageChange,
  groupName = "",
  onGroupNameChange,
  groupDescription = "",
  onGroupDescriptionChange,
}: Step5IdentityProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const activePreset = PRESET_COVERS.find((c) => c.id === coverImage);
  const isUploadedCover = coverImage === "uploaded";
  const isUploadedAvatar = avatarImage === "uploaded";

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onCoverImageChange("uploaded");
  };
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onAvatarImageChange("uploaded");
  };

  // Drag-and-drop for avatar
  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) onAvatarImageChange("uploaded");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* ── Group identity (shared component, same as step 3) ── */}
      <GroupIdentityFields
        groupName={groupName}
        onGroupNameChange={(v) => onGroupNameChange?.(v)}
        groupDescription={groupDescription}
        onGroupDescriptionChange={(v) => onGroupDescriptionChange?.(v)}
        selectedActivity={activity}
        subtitle="Refine the name and description you set earlier."
      />

      {/* ── Plan photo (cover) preview ── */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">
            Plan photo
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            This image appears on the plan card visible to all members.
          </p>
        </div>

        {/* Cover preview tile — click to upload */}
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className={cn(
            "group relative w-full h-40 rounded-2xl overflow-hidden border-2 transition-all duration-200 flex items-center justify-center",
            isUploadedCover
              ? "border-primary/40"
              : coverImage
                ? "border-transparent"
                : "border-dashed border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-primary/3",
          )}
        >
          {/* Gradient background when preset selected */}
          {!isUploadedCover && coverImage && (
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br transition-all duration-500",
                activePreset?.gradient,
              )}
            />
          )}

          {/* Uploaded state overlay */}
          {isUploadedCover && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <ImagePlus size={28} className="text-primary/50" />
            </div>
          )}

          {/* Empty / hover state */}
          {!coverImage && (
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Upload
                  size={18}
                  className="text-muted-foreground group-hover:text-primary/70 transition-colors"
                />
              </div>
              <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Upload plan photo
              </p>
            </div>
          )}

          {/* Edit overlay on hover when something is set */}
          {coverImage && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                Change photo
              </span>
            </div>
          )}

          {/* Clear button */}
          {coverImage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCoverImageChange(null);
              }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors z-10"
              aria-label="Remove cover"
            >
              <X size={12} className="text-white" />
            </button>
          )}
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleCoverFile}
        />

        {/* Color presets — refined palette, 3 cols on mobile → 6 on sm */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESET_COVERS.map(({ id, gradient, label }) => {
            const selected = coverImage === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onCoverImageChange(selected ? null : id)}
                aria-pressed={selected}
                className={cn(
                  "group relative h-14 rounded-xl bg-gradient-to-br transition-all duration-200 overflow-hidden border-2",
                  gradient,
                  selected
                    ? "border-primary shadow-md shadow-primary/20 scale-[1.04]"
                    : "border-transparent hover:scale-[1.03] hover:shadow-sm",
                )}
              >
                <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white/85 drop-shadow-sm">
                  {label}
                </span>
                {selected && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/95 flex items-center justify-center shadow-sm">
                    <Check size={9} className="text-primary" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Group avatar upload ── */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">
            Group avatar
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            A square icon that identifies your group across the app. Drag and
            drop or tap to upload.
          </p>
        </div>

        <div className="flex items-start gap-4">
          {/* Avatar preview circle */}
          <div
            className={cn(
              "relative w-20 h-20 rounded-2xl border-2 shrink-0 overflow-hidden flex items-center justify-center transition-all duration-200",
              isUploadedAvatar
                ? "border-primary/40 bg-primary/10"
                : "border-dashed border-border/60 bg-muted/40",
            )}
          >
            {isUploadedAvatar ? (
              <>
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Check size={16} className="text-primary" strokeWidth={2.5} />
                </div>
                <button
                  type="button"
                  onClick={() => onAvatarImageChange(null)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center"
                  aria-label="Remove avatar"
                >
                  <X size={10} className="text-white" />
                </button>
              </>
            ) : (
              <ImagePlus size={20} className="text-muted-foreground/50" />
            )}
          </div>

          {/* Drop zone */}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleAvatarDrop}
            className={cn(
              "group flex-1 min-h-20 rounded-2xl border-dashed border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 p-4",
              isUploadedAvatar
                ? "border-primary/30 bg-primary/5"
                : "border-border/50 bg-card hover:border-primary/40 hover:bg-primary/3",
            )}
          >
            <Upload
              size={16}
              className={cn(
                "transition-colors",
                isUploadedAvatar
                  ? "text-primary/60"
                  : "text-muted-foreground/50 group-hover:text-primary/60",
              )}
            />
            <p
              className={cn(
                "text-xs font-medium text-center transition-colors",
                isUploadedAvatar
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              {isUploadedAvatar
                ? "Avatar selected — tap to change"
                : "Drag & drop or tap to upload"}
            </p>
            <p className="text-[11px] text-muted-foreground/50">
              PNG, JPG, WEBP up to 5 MB
            </p>
          </button>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleAvatarFile}
        />
      </div>

      {/* ── Live preview card ── */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground">Preview</p>
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
          {/* Cover */}
          <div
            className={cn(
              "h-24 w-full transition-all duration-500",
              isUploadedCover
                ? "bg-primary/15"
                : coverImage
                  ? `bg-gradient-to-br ${activePreset?.gradient}`
                  : "bg-muted/40",
            )}
          />
          {/* Info */}
          <div className="px-4 pb-4 pt-0 flex items-start gap-3">
            <div
              className={cn(
                "w-14 h-14 rounded-xl border-4 border-card -mt-7 shrink-0 shadow-md flex items-center justify-center transition-all duration-300",
                isUploadedAvatar
                  ? "bg-primary/20"
                  : coverImage
                    ? `bg-gradient-to-br ${activePreset?.gradient}`
                    : "bg-muted",
              )}
            >
              {isUploadedAvatar && (
                <Check size={18} className="text-primary" strokeWidth={2.5} />
              )}
            </div>
            <div className="min-w-0 pt-2">
              <h3 className="text-sm font-bold text-foreground truncate">
                {planName || "Untitled Group"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activity || "Activity not set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
