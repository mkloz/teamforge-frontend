import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SettingsProfileForm } from "./components/settings-profile-form";
import { useSettingsProfileForm } from "./hooks/use-settings-profile-form";

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-36 rounded-xl" />
      <Skeleton className="h-5 w-96 max-w-full rounded-lg" />
      <Skeleton className="h-52 w-full rounded-2xl" />
      <Skeleton className="h-88 w-full rounded-2xl" />
    </div>
  );
}

export function SettingsPage() {
  const {
    currentUser,
    form,
    isLoading,
    isError,
    refetch,
    onSubmit,
    isSaving,
    isUploadingAvatar,
    saveMessage,
    saveError,
    avatarMessage,
    avatarError,
    profileSummary,
    uploadAvatar,
  } = useSettingsProfileForm();

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-3 text-sm text-slate-muted">
          We couldn't load your settings right now.
        </p>
        <Button className="mt-5" variant="primary" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-ink">Settings</h1>
        <p className="text-sm leading-relaxed text-slate-muted">
          Manage the account details that already map cleanly to the backend
          today.
        </p>
      </div>

      <SettingsProfileForm
        currentUser={currentUser}
        form={form}
        onSubmit={onSubmit}
        onAvatarSelect={uploadAvatar}
        isSaving={isSaving}
        isUploadingAvatar={isUploadingAvatar}
        saveMessage={saveMessage}
        saveError={saveError}
        avatarMessage={avatarMessage}
        avatarError={avatarError}
        profileSummary={profileSummary}
      />
    </div>
  );
}
