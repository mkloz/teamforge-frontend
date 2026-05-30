import type { UseFormReturn } from "react-hook-form";
import type { SettingsProfileValues } from "@/features/settings/schemas/settings-profile.schema";
import type { User } from "@/shared/schemas";

export interface AccountSettingsSectionProps {
  currentUser: User | undefined;
  form: UseFormReturn<SettingsProfileValues>;
  onSubmit: () => void;
  onAvatarSelect: (file: File) => Promise<unknown>;
  onAvatarDelete: () => Promise<unknown>;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  isDeletingAvatar: boolean;
  saveError: string | null;
  avatarError: string | null;
  profileSummary: Array<{ label: string; value: string }>;
}
