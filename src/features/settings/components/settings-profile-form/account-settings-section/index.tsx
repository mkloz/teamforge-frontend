import { useEffect } from "react";
import { ErrorProfileSaveVisual } from "@/assets/error-state/error-profile-save";
import { useCompatibilityInputLock } from "@/features/forge-proposals/public/proposal-review";
import { buildSettingsProfileFormValues } from "@/features/settings/lib/settings-profile-mappers";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Notice } from "@/shared/components/ui/notice";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { AccountFacts } from "./account-facts";
import { AccountFormFooter } from "./account-form-footer";
import { AreaFields } from "./area-fields";
import { AvatarProfileSection } from "./avatar-profile-section";
import { FormGroup } from "./form-group";
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
    form.resetField("city", { defaultValue: savedValues.city });
    form.resetField("locationLat", {
      defaultValue: savedValues.locationLat,
    });
    form.resetField("locationLng", {
      defaultValue: savedValues.locationLng,
    });
  }, [compatibilityInputLock.isBlocked, currentUser, form]);

  return (
    <div className="flex flex-col gap-9">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <AvatarProfileSection
          currentUser={currentUser}
          avatarError={errors.avatarError}
          isUploadingAvatar={status.isUploadingAvatar}
          isDeletingAvatar={status.isDeletingAvatar}
          isOnline={status.isOnline}
          onAvatarSelect={onAvatarSelect}
          onAvatarDelete={onAvatarDelete}
        />

        <AccountFacts currentUser={currentUser} />
      </section>

      <Form {...form}>
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
          <FormGroup
            title="Name and intro"
            description="These are the first details people see when they open your profile."
          >
            <ProfileIdentityFields currentUser={currentUser} form={form} />
          </FormGroup>

          {compatibilityInputLock.isBlocked ? (
            <Notice
              role={
                compatibilityInputLock.status === "error" ? "alert" : "status"
              }
              tone={
                compatibilityInputLock.status === "error"
                  ? "warning"
                  : "neutral"
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

          <FormGroup
            title="Personal context"
            description="Update your age, gender, and city."
          >
            <PersonalContextFields
              form={form}
              compatibilityInputsDisabled={compatibilityInputLock.isBlocked}
            />
          </FormGroup>

          <FormGroup
            title="Area"
            description="Your city helps nearby groups make sense. Exact coordinates stay private."
          >
            <AreaFields
              currentUser={currentUser}
              form={form}
              disabled={compatibilityInputLock.isBlocked}
            />
          </FormGroup>

          {errors.saveError && (
            <Notice
              role="alert"
              tone="danger"
              size="md"
              icon={
                <ErrorProfileSaveVisual className="h-6 w-auto text-foreground" />
              }
              className="items-center gap-3"
              iconClassName="mt-0"
            >
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
    </div>
  );
}
