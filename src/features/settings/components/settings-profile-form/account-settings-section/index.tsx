import { AccountFacts } from "./account-facts";
import { AccountFormFooter } from "./account-form-footer";
import { AreaFields } from "./area-fields";
import { AvatarProfileSection } from "./avatar-profile-section";
import { FormGroup } from "./form-group";
import { PersonalContextFields } from "./personal-context-fields";
import { ProfileIdentityFields } from "./profile-identity-fields";
import type { AccountSettingsSectionProps } from "./types";
import { Form } from "@/shared/components/ui/form";

export function AccountSettingsSection({
  currentUser,
  form,
  onSubmit,
  onAvatarSelect,
  onAvatarDelete,
  isSaving,
  isUploadingAvatar,
  isDeletingAvatar,
  saveMessage,
  saveError,
  avatarMessage,
  avatarError,
}: AccountSettingsSectionProps) {
  return (
    <div className="flex flex-col gap-9">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <AvatarProfileSection
          currentUser={currentUser}
          avatarMessage={avatarMessage}
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

          {(saveMessage || saveError) && (
            <p
              className={`text-sm ${saveError ? "text-destructive" : "text-forge-teal"}`}
            >
              {saveError ?? saveMessage}
            </p>
          )}

          <AccountFormFooter isSaving={isSaving} />
        </form>
      </Form>
    </div>
  );
}
