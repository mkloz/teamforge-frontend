import { useEffect } from "react";
import { useCompatibilityInputLock } from "@/features/forge-proposals/public/proposal-review";
import { buildSettingsProfileFormValues } from "@/features/settings/lib/settings-profile-mappers";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Notice } from "@/shared/components/ui/notice";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { AccountFormFooter } from "./account-form-footer";
import { AccountSettingsCard } from "./account-settings-card";
import { AreaFields } from "./area-fields";
import { AvatarProfileSection } from "./avatar-profile-section";
import { PersonalContextFields } from "./personal-context-fields";
import { ProfileIdentityFields } from "./profile-identity-fields";
import type { AccountSettingsSectionProps } from "./types";

export function AccountSettingsSection({
  currentUser,
  form,
  onSubmit,
  onAvatarSelect,
  onAvatarDelete,
  status,
  errors,
}: AccountSettingsSectionProps) {
  const compatibilityInputLock = useCompatibilityInputLock();

  useEffect(() => {
    if (!compatibilityInputLock.isBlocked || !currentUser) {
      return;
    }

    const savedValues = buildSettingsProfileFormValues(currentUser);

    form.resetField("age", { defaultValue: savedValues.age });
    form.resetField("gender", { defaultValue: savedValues.gender });
    form.setValue("gender", savedValues.gender, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    form.resetField("city", { defaultValue: savedValues.city });
    form.resetField("locationLat", {
      defaultValue: savedValues.locationLat,
    });
    form.resetField("locationLng", {
      defaultValue: savedValues.locationLng,
    });
  }, [compatibilityInputLock.isBlocked, currentUser, form]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5 [&_[data-slot=form-label]]:text-slate-muted [&_[data-slot=label]]:text-slate-muted"
        onSubmit={onSubmit}
      >
        <AccountSettingsCard
          title="Public profile"
          description="Shape the identity other people see across TeamForge."
        >
          <AvatarProfileSection
            currentUser={currentUser}
            avatarError={errors.avatarError}
            isUploadingAvatar={status.isUploadingAvatar}
            isDeletingAvatar={status.isDeletingAvatar}
            isOnline={status.isOnline}
            onAvatarSelect={onAvatarSelect}
            onAvatarDelete={onAvatarDelete}
          />

          <div className="mt-6">
            <ProfileIdentityFields currentUser={currentUser} form={form} />
          </div>
        </AccountSettingsCard>

        {compatibilityInputLock.isBlocked ? (
          <Notice
            role={
              compatibilityInputLock.status === "error" ? "alert" : "status"
            }
            tone={
              compatibilityInputLock.status === "error" ? "warning" : "neutral"
            }
            size="md"
            action={
              compatibilityInputLock.status === "error" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => void compatibilityInputLock.retry()}
                >
                  Try again
                </Button>
              ) : null
            }
          >
            {compatibilityInputLock.message}
          </Notice>
        ) : null}

        <AccountSettingsCard
          title="Personal details"
          description="Used to improve group recommendations. You control what appears publicly."
        >
          <PersonalContextFields
            form={form}
            compatibilityInputsDisabled={compatibilityInputLock.isBlocked}
          />

          <div className="mt-6">
            <AreaFields
              currentUser={currentUser}
              form={form}
              disabled={compatibilityInputLock.isBlocked}
            />
          </div>
        </AccountSettingsCard>

        {errors.saveError && (
          <Notice role="alert" tone="danger" size="md" statusIcon>
            {errors.saveError}
          </Notice>
        )}

        {!status.isOnline ? (
          <OfflineNotice withIcon={false} size="md" className="px-3">
            You are offline. Reconnect before saving profile changes.
          </OfflineNotice>
        ) : null}

        <AccountFormFooter
          isOnline={status.isOnline}
          isSaving={status.isSaving}
        />
      </form>
    </Form>
  );
}
