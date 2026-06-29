import type { AccountSettingsState } from "../settings-form-types";

export type AccountSettingsStatus = Pick<
  AccountSettingsState,
  "isOnline" | "isSaving" | "isUploadingAvatar" | "isDeletingAvatar"
>;

export type AccountSettingsErrors = Pick<
  AccountSettingsState,
  "saveError" | "avatarError"
>;

export type AccountSettingsSectionProps = Pick<
  AccountSettingsState,
  | "currentUser"
  | "form"
  | "onSubmit"
  | "onAvatarSelect"
  | "onAvatarDelete"
  | "profileSummary"
> & {
  status: AccountSettingsStatus;
  errors: AccountSettingsErrors;
};
