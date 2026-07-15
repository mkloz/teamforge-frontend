import { ErrorProfileSaveVisual } from "@/assets/error-state/error-profile-save";
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

          <FormGroup
            title="Personal context"
            description="Update your age, gender, and city."
          >
            <PersonalContextFields form={form} />
          </FormGroup>

          <FormGroup
            title="Area"
            description="Your city helps nearby groups make sense. Exact coordinates stay private."
          >
            <AreaFields currentUser={currentUser} form={form} />
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
