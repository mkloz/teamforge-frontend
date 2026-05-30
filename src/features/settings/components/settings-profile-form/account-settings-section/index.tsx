import { ErrorProfileSaveVisual } from "@/assets/error-state/error-profile-save";
import { Form } from "@/shared/components/ui/form";
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
  isSaving,
  isUploadingAvatar,
  isDeletingAvatar,
  saveError,
  avatarError,
}: AccountSettingsSectionProps) {
  return (
    <div className="flex flex-col gap-9">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <AvatarProfileSection
          currentUser={currentUser}
          avatarError={avatarError}
          isUploadingAvatar={isUploadingAvatar}
          isDeletingAvatar={isDeletingAvatar}
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
            description="Keep these accurate so profiles feel clear without oversharing."
          >
            <PersonalContextFields form={form} />
          </FormGroup>

          <FormGroup
            title="Area"
            description="Your city helps nearby groups make sense. Exact coordinates stay private."
          >
            <AreaFields currentUser={currentUser} form={form} />
          </FormGroup>

          {saveError && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-3">
              <ErrorProfileSaveVisual className="h-6 w-auto shrink-0 text-foreground" />
              <p className="text-destructive text-sm">{saveError}</p>
            </div>
          )}

          <AccountFormFooter isSaving={isSaving} />
        </form>
      </Form>
    </div>
  );
}
