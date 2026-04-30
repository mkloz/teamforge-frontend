import { useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { ActivityApi } from "@/features/activity/api/activity.api";
import { ActivityQueries } from "@/features/activity/api/activity.queries";
import type { Group } from "@/features/activity/lib/activity-contract";
import { FileUploadApi } from "@/shared/api/file-upload";
import { Avatar } from "@/shared/components/common/avatar";
import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import {
  getPlanCoverPreset,
  PLAN_COVER_PRESETS,
} from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";

interface EditGroupIdentityDialogProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function EditGroupIdentityDialog({
  group,
  open,
  onOpenChange,
}: EditGroupIdentityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <EditGroupIdentityDialogContent
          group={group}
          onOpenChange={onOpenChange}
        />
      )}
    </Dialog>
  );
}

interface EditGroupIdentityDialogContentProps {
  group: Group;
  onOpenChange: (open: boolean) => void;
}

function EditGroupIdentityDialogContent({
  group,
  onOpenChange,
}: EditGroupIdentityDialogContentProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [avatar, setAvatar] = useState(group.avatar ?? "");
  const [coverImage, setCoverImage] = useState(group.plan?.coverImage ?? null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(
    null,
  );
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const activeCoverPreset = useMemo(
    () => getPlanCoverPreset(coverImage),
    [coverImage],
  );

  const uploadImage = async (
    file: File,
    onUploaded: (url: string) => void,
    setUploading: (value: boolean) => void,
    setUploadError: (value: string | null) => void,
  ) => {
    setUploading(true);
    setUploadError(null);

    try {
      const uploaded = await FileUploadApi.uploadImage(file);
      onUploaded(uploaded.url);
    } catch (error) {
      setUploadError(
        getApiErrorMessage(error, "We couldn't upload that image. Try again."),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarFiles = (files: File[]) => {
    const file = files[0];

    if (file) {
      void uploadImage(
        file,
        setAvatar,
        setIsAvatarUploading,
        setAvatarUploadError,
      );
    }
  };

  const handleCoverFiles = (files: File[]) => {
    const file = files[0];

    if (file) {
      void uploadImage(
        file,
        setCoverImage,
        setIsCoverUploading,
        setCoverUploadError,
      );
    }
  };

  const mutation = useMutation({
    mutationKey: ["activity", "group-identity", "update", group.id],
    mutationFn: async () => {
      const groupPayload = {
        name: name.trim(),
        description: normalizeOptionalText(description),
        avatar: normalizeOptionalText(avatar),
      };
      const requests: Array<Promise<unknown>> = [];

      if (
        groupPayload.name !== group.name ||
        groupPayload.description !== group.description ||
        groupPayload.avatar !== group.avatar
      ) {
        requests.push(ActivityApi.updateGroup(group.id, groupPayload));
      }

      if (group.plan && coverImage !== group.plan.coverImage) {
        requests.push(
          ActivityApi.updatePlan(group.plan.id, {
            coverImage,
          }),
        );
      }

      await Promise.all(requests);
    },
    onSuccess: async () => {
      setError(null);
      onOpenChange(false);
      await ActivityQueries.invalidateGroupSurfaces();
    },
    onError: (error) => {
      setError(
        getApiErrorMessage(
          error,
          "We couldn't save those changes. Please try again.",
        ),
      );
    },
  });

  const isNameValid = name.trim().length > 0;
  const hasChanges =
    name.trim() !== group.name ||
    normalizeOptionalText(description) !== group.description ||
    normalizeOptionalText(avatar) !== group.avatar ||
    coverImage !== (group.plan?.coverImage ?? null);

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Group settings</DialogTitle>
        <DialogDescription className="sr-only">
          Edit group settings
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="group-name"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Name
          </label>
          <input
            id="group-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="group-description"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Description
          </label>
          <textarea
            id="group-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Avatar
          </p>
          <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr]">
            <Avatar
              src={avatar || null}
              name={name}
              shape="rounded"
              className="size-18 rounded-xl border border-border bg-muted"
            />
            <div className="flex min-w-0 flex-col gap-2">
              <FileDropzone
                inputRef={avatarInputRef}
                variant="inline"
                accept="image/*"
                title={avatar ? "Replace avatar" : "Upload avatar"}
                description="Drop a square group image here."
                helper="PNG, JPG, WEBP up to 5 MB"
                actionLabel="Browse"
                isUploading={isAvatarUploading}
                error={avatarUploadError}
                onFiles={handleAvatarFiles}
              />
              {avatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="self-start"
                  onClick={() => setAvatar("")}
                >
                  <X className="size-4" aria-hidden="true" />
                  Remove avatar
                </Button>
              )}
            </div>
          </div>
        </div>

        {group.plan && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Plan cover
            </p>
            <div className="relative">
              <FileDropzone
                inputRef={coverInputRef}
                variant="cover"
                accept="image/*"
                title={coverImage ? "Change cover" : "Upload cover"}
                description="Drop a plan image here or browse from your device."
                helper="PNG, JPG, WEBP up to 5 MB"
                actionLabel="Browse"
                isUploading={isCoverUploading}
                error={coverUploadError}
                onFiles={handleCoverFiles}
                preview={
                  <div className="h-full w-full">
                    <PlanCover
                      value={coverImage}
                      alt={`${group.name} cover preview`}
                      imageClassName="transition-transform duration-500"
                    />
                  </div>
                }
              />
              {coverImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2 top-2 z-20 rounded-full bg-black/45 text-white hover:bg-black/65 hover:text-white"
                  onClick={() => setCoverImage(null)}
                  aria-label="Remove cover"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {PLAN_COVER_PRESETS.map(({ id, gradient, label }) => {
                const selected = coverImage === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCoverImage(selected ? null : id)}
                    aria-pressed={selected}
                    className={cn(
                      "group relative h-14 overflow-hidden rounded-xl border-2 bg-linear-to-br transition duration-200",
                      gradient,
                      selected
                        ? "border-forge-teal shadow-md shadow-forge-teal/20"
                        : "border-transparent hover:scale-[1.03] hover:shadow-sm",
                    )}
                  >
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white/85 drop-shadow-sm">
                      {label}
                    </span>
                    {selected && (
                      <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-white/95 shadow-sm">
                        <Check
                          size={9}
                          className="text-forge-teal"
                          strokeWidth={3}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {activeCoverPreset && (
              <p className="text-[11px] font-medium text-muted-foreground">
                Selected: {activeCoverPreset.label}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={
            !isNameValid ||
            !hasChanges ||
            mutation.isPending ||
            isAvatarUploading ||
            isCoverUploading
          }
          onClick={() => void mutation.mutateAsync()}
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
