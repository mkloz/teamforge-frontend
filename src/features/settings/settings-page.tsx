import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SettingsProfileForm } from "./components/settings-profile-form";
import { useSettingsProfileForm } from "./hooks/use-settings-profile-form";
import { useSettingsRouteState } from "./hooks/use-settings-route-state";
import type { SettingsSection } from "@/shared/lib/settings-route";

const SETTINGS_SECTIONS: Array<{
  id: SettingsSection;
  label: string;
  description: string;
}> = [
  {
    id: "account",
    label: "Account",
    description: "Profile details, photo, and backend-backed basics.",
  },
  {
    id: "matching",
    label: "Matching",
    description: "Personality and interests that shape your group results.",
  },
  {
    id: "security",
    label: "Security",
    description: "Sign-in provider, verification, and password safety.",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Choose which in-app updates TeamForge should surface.",
  },
];

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
  const { activeSection, setActiveSection } = useSettingsRouteState();
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
    securityMessage,
    securityError,
    profileSummary,
    uploadAvatar,
    sendPasswordResetLink,
    isSendingPasswordResetLink,
    sessions,
    isLoadingSessions,
    sessionsError,
    revokeSession,
    revokingSessionId,
    revokeOtherSessions,
    isRevokingOtherSessions,
    notificationPreferences,
    isLoadingNotificationPreferences,
    notificationPreferencesError,
    notificationPreferencesMessage,
    updateNotificationPreference,
    isSavingNotificationPreferences,
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
          Manage the parts of TeamForge that already have real backend support.
        </p>
      </div>

      <nav
        aria-label="Settings sections"
        className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-3"
      >
        {SETTINGS_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-48 flex-1 flex-col rounded-2xl border px-4 py-3 text-left transition-colors ${
                isActive
                  ? "border-forge-teal/30 bg-forge-teal/8"
                  : "border-border/70 bg-canvas hover:border-forge-teal/20"
              }`}
            >
              <span className="text-sm font-semibold text-ink">
                {section.label}
              </span>
              <span className="mt-1 text-xs leading-relaxed text-slate-muted">
                {section.description}
              </span>
            </button>
          );
        })}
      </nav>

      <SettingsProfileForm
        activeSection={activeSection}
        currentUser={currentUser}
        form={form}
        onSubmit={onSubmit}
        onAvatarSelect={uploadAvatar}
        isSaving={isSaving}
        isUploadingAvatar={isUploadingAvatar}
        onSendPasswordResetLink={sendPasswordResetLink}
        isSendingPasswordResetLink={isSendingPasswordResetLink}
        saveMessage={saveMessage}
        saveError={saveError}
        avatarMessage={avatarMessage}
        avatarError={avatarError}
        securityMessage={securityMessage}
        securityError={securityError}
        profileSummary={profileSummary}
        sessions={sessions}
        isLoadingSessions={isLoadingSessions}
        sessionsError={sessionsError}
        onRevokeSession={revokeSession}
        revokingSessionId={revokingSessionId}
        onRevokeOtherSessions={revokeOtherSessions}
        isRevokingOtherSessions={isRevokingOtherSessions}
        notificationPreferences={notificationPreferences}
        isLoadingNotificationPreferences={isLoadingNotificationPreferences}
        notificationPreferencesError={notificationPreferencesError}
        notificationPreferencesMessage={notificationPreferencesMessage}
        onNotificationPreferenceChange={updateNotificationPreference}
        isSavingNotificationPreferences={isSavingNotificationPreferences}
      />
    </div>
  );
}
