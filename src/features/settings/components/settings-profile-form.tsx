import { Link } from "@tanstack/react-router";

import { buildProfileNavigation } from "@/shared/lib/app-route";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/shared/lib/onboarding-route";
import type { SettingsSection } from "@/shared/lib/settings-route";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type {
  AuthSession,
  NotificationPreferences,
  User,
} from "@/shared/schemas";
import { cn } from "@/shared/lib/utils";
import { LaptopMinimal, LogOut, Shield, Smartphone } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import {
  unspecifiedGenderValue,
  type SettingsProfileValues,
} from "../schemas/settings-profile.schema";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Other" },
] as const;

const NOTIFICATION_PREFERENCE_ITEMS: Array<{
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}> = [
  {
    key: "notifyFriendRequests",
    title: "Friend requests",
    description: "New requests and accepted connections.",
  },
  {
    key: "notifyGroupInvites",
    title: "Group invites",
    description: "Invitations and join approvals for new groups.",
  },
  {
    key: "notifyGroupActivity",
    title: "Group activity",
    description: "Plan changes, proposal updates, and lifecycle events.",
  },
  {
    key: "notifyMessages",
    title: "Messages",
    description: "Direct and group chat message activity.",
  },
  {
    key: "notifyAccount",
    title: "Account security",
    description: "Important sign-in and account protection updates.",
  },
] as const;

const EMAIL_PREFERENCE_ITEMS: Array<{
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}> = [
  {
    key: "emailFriendRequests",
    title: "Friend requests",
    description: "Send inbox alerts for new requests and accepted connections.",
  },
  {
    key: "emailGroupInvites",
    title: "Group invites",
    description: "Send inbox alerts for invitations and join approvals.",
  },
  {
    key: "emailGroupActivity",
    title: "Group activity",
    description:
      "Send inbox alerts for plan changes, proposals, and group events.",
  },
  {
    key: "emailMessages",
    title: "Messages",
    description: "Send inbox alerts when new direct or group messages arrive.",
  },
  {
    key: "emailAccount",
    title: "Account security",
    description: "Send inbox alerts for password and session security events.",
  },
] as const;

function normalizeTrustScore(score: number) {
  if (score > 0 && score <= 1) {
    return Math.round(score * 100);
  }

  return Math.round(score);
}

function formatSessionTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function describeSessionDevice(session: AuthSession) {
  const userAgent = session.userAgent?.toLowerCase() ?? "";
  const isMobile =
    userAgent.includes("iphone") ||
    userAgent.includes("android") ||
    userAgent.includes("mobile");

  return {
    label: isMobile ? "Mobile session" : "Browser session",
    icon: isMobile ? Smartphone : LaptopMinimal,
  };
}

interface SettingsProfileFormProps {
  activeSection: SettingsSection;
  currentUser: User | undefined;
  form: UseFormReturn<SettingsProfileValues>;
  onSubmit: () => void;
  onAvatarSelect: (file: File) => Promise<unknown>;
  onSendPasswordResetLink: () => Promise<unknown>;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  onRevokeOtherSessions: () => Promise<void>;
  onNotificationPreferenceChange: (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => Promise<void>;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  isSendingPasswordResetLink: boolean;
  isRevokingOtherSessions: boolean;
  isLoadingSessions: boolean;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  revokingSessionId: string | null;
  saveMessage: string | null;
  saveError: string | null;
  avatarMessage: string | null;
  avatarError: string | null;
  securityMessage: string | null;
  securityError: string | null;
  notificationPreferencesMessage: string | null;
  notificationPreferencesError: string | null;
  sessionsError: string | null;
  profileSummary: Array<{ label: string; value: string }>;
  sessions: AuthSession[];
  notificationPreferences: NotificationPreferences | null;
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-canvas px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">
        {value ?? "Not set"}
      </p>
    </div>
  );
}

function SessionRow({
  session,
  isRevoking,
  onRevoke,
}: {
  session: AuthSession;
  isRevoking: boolean;
  onRevoke: (session: AuthSession) => Promise<void>;
}) {
  const device = describeSessionDevice(session);
  const DeviceIcon = device.icon;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-canvas p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-full border border-border bg-card p-2 text-slate-muted">
          <DeviceIcon size={16} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{device.label}</p>
            {session.isCurrent && (
              <span className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-2 py-0.5 text-[11px] font-semibold text-forge-teal">
                Current
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-muted">
            Started {formatSessionTime(session.createdAt)}
          </p>
          <p className="mt-1 text-xs text-slate-muted">
            Expires {formatSessionTime(session.expiresAt)}
          </p>
          {session.ipAddress && (
            <p className="mt-1 text-xs text-slate-muted">
              IP {session.ipAddress}
            </p>
          )}
          {session.userAgent && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-muted">
              {session.userAgent}
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className={
          session.isCurrent
            ? "border-destructive/40 text-destructive hover:bg-destructive/10"
            : undefined
        }
        disabled={isRevoking}
        onClick={() => {
          void onRevoke(session);
        }}
      >
        <LogOut size={14} />
        {isRevoking
          ? "Signing out..."
          : session.isCurrent
            ? "Sign out here"
            : "Revoke"}
      </Button>
    </div>
  );
}

function NotificationPreferenceRow({
  checked,
  title,
  description,
  onToggle,
  disabled,
}: {
  checked: boolean;
  title: string;
  description: string;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition-colors",
        checked
          ? "border-forge-teal/25 bg-forge-teal/8"
          : "border-border/70 bg-canvas",
        disabled && "cursor-not-allowed opacity-70",
      )}
    >
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-muted">
          {description}
        </p>
      </div>

      <div
        className={cn(
          "relative h-7 w-12 rounded-full border transition-colors",
          checked
            ? "border-forge-teal/30 bg-forge-teal"
            : "border-border bg-card",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-0.5",
          )}
        />
      </div>
    </button>
  );
}

export function SettingsProfileForm({
  activeSection,
  currentUser,
  form,
  onSubmit,
  onAvatarSelect,
  onSendPasswordResetLink,
  onRevokeSession,
  onRevokeOtherSessions,
  onNotificationPreferenceChange,
  isSaving,
  isUploadingAvatar,
  isSendingPasswordResetLink,
  isRevokingOtherSessions,
  isLoadingSessions,
  isLoadingNotificationPreferences,
  isSavingNotificationPreferences,
  revokingSessionId,
  saveMessage,
  saveError,
  avatarMessage,
  avatarError,
  securityMessage,
  securityError,
  notificationPreferencesMessage,
  notificationPreferencesError,
  sessionsError,
  profileSummary,
  sessions,
  notificationPreferences,
}: SettingsProfileFormProps) {
  return (
    <div className="flex flex-col gap-6">
      {activeSection === "account" && (
        <>
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-border bg-canvas text-lg font-bold text-forge-teal">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    currentUser?.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("") || "TF"
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-ink">
                    Account Snapshot
                  </h2>
                  <p className="mt-1 text-sm text-slate-muted">
                    Keep your profile accurate with the same backend data the
                    rest of the app reads.
                  </p>
                </div>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-ink">
                Update photo
                <Input
                  type="file"
                  accept="image/*"
                  className="max-w-72 cursor-pointer"
                  disabled={isUploadingAvatar}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }

                    void onAvatarSelect(file).finally(() => {
                      event.target.value = "";
                    });
                  }}
                />
              </label>
            </div>

            {(avatarMessage || avatarError) && (
              <p
                className={`mt-4 text-sm ${avatarError ? "text-destructive" : "text-forge-teal"}`}
              >
                {avatarError ?? avatarMessage}
              </p>
            )}

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {profileSummary.map((item) => (
                <StatPill
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex flex-col gap-2">
              <h2 className="text-xl font-bold text-ink">Profile Details</h2>
              <p className="text-sm text-slate-muted">
                These fields map directly to your backend user profile.
              </p>
            </div>

            <Form {...form}>
              <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Avery Johnson" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-ink">
                      Email
                    </label>
                    <Input value={currentUser?.email ?? ""} disabled readOnly />
                    <p className="text-xs text-slate-muted">
                      Email changes are not exposed by the current API.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            inputMode="numeric"
                            placeholder="24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Gender</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={unspecifiedGenderValue}>
                              Prefer not to say
                            </SelectItem>
                            {GENDER_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="London" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={4}
                          placeholder="A quick intro people will see on your profile."
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-ink shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-thick focus-visible:ring-ring/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(saveMessage || saveError) && (
                  <p
                    className={`text-sm ${saveError ? "text-destructive" : "text-forge-teal"}`}
                  >
                    {saveError ?? saveMessage}
                  </p>
                )}

                <div className="flex flex-col gap-3 border-t border-border/70 pt-5 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-slate-muted">
                    Save your backend-backed profile changes here.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                      <Link {...buildProfileNavigation()}>View Profile</Link>
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </section>
        </>
      )}

      {activeSection === "matching" && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink">
                Matching Preferences Snapshot
              </h2>
              <p className="mt-1 text-sm text-slate-muted">
                This reflects what the compatibility engine already knows about
                you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatPill
                label="Personality Type"
                value={currentUser?.personalityType ?? "Not set"}
              />
              <StatPill
                label="Trust Score"
                value={
                  currentUser
                    ? `${normalizeTrustScore(currentUser.trustScore)}%`
                    : "0%"
                }
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-muted">
              Interests
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {currentUser?.interests?.length ? (
                currentUser.interests.slice(0, 12).map((interest) => (
                  <span
                    key={interest.id}
                    className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 py-1 text-xs font-semibold text-forge-teal"
                  >
                    {interest.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-muted">
                  No interests have been saved yet.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-muted">
              Update the signals TeamForge uses when forming your groups.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link
                  {...buildPersonalityEditNavigation({
                    returnTo: "/settings",
                    returnSection: "matching",
                  })}
                >
                  Update Personality
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link
                  {...buildInterestsEditNavigation({
                    returnTo: "/settings",
                    returnSection: "matching",
                  })}
                >
                  Update Interests
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeSection === "security" && (
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-ink">Security & Access</h2>
              <p className="text-sm text-slate-muted">
                Review how this account signs in, recover access, and manage
                active sessions.
              </p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatPill label="Email" value={currentUser?.email ?? "Not set"} />
              <StatPill
                label="Provider"
                value={
                  currentUser?.authProvider === "GOOGLE" ? "Google" : "Email"
                }
              />
              <StatPill
                label="Verification"
                value={currentUser?.emailVerified ? "Verified" : "Pending"}
              />
              <StatPill
                label="Profile Complete"
                value={
                  currentUser?.profileComplete ? "Complete" : "In progress"
                }
              />
            </div>

            <div className="mt-6 rounded-2xl border border-border/70 bg-canvas p-5">
              <h3 className="text-base font-semibold text-ink">
                Password & recovery
              </h3>
              <p className="mt-1 text-sm text-slate-muted">
                {currentUser?.authProvider === "GOOGLE"
                  ? "This account signs in with Google, so password changes are managed by Google instead of TeamForge."
                  : "Send a secure password reset link to your email if you want to rotate your password."}
              </p>

              {(securityMessage || securityError) && (
                <p
                  className={`mt-4 text-sm ${securityError ? "text-destructive" : "text-forge-teal"}`}
                >
                  {securityError ?? securityMessage}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {currentUser?.authProvider === "EMAIL" ? (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isSendingPasswordResetLink}
                    onClick={() => {
                      void onSendPasswordResetLink();
                    }}
                  >
                    {isSendingPasswordResetLink
                      ? "Sending link..."
                      : "Send reset link"}
                  </Button>
                ) : (
                  <Button type="button" variant="outline" disabled>
                    Password managed by Google
                  </Button>
                )}

                <Button asChild variant="outline">
                  <Link {...buildProfileNavigation()}>
                    Review public profile
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Active sessions
                </h3>
                <p className="mt-1 text-sm text-slate-muted">
                  Revoke devices you no longer trust and keep the current one in
                  view.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={isRevokingOtherSessions || sessions.length <= 1}
                onClick={() => {
                  void onRevokeOtherSessions();
                }}
              >
                <Shield size={14} />
                {isRevokingOtherSessions
                  ? "Signing out others..."
                  : "Sign out other devices"}
              </Button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {isLoadingSessions ? (
                <p className="text-sm text-slate-muted">Loading sessions...</p>
              ) : sessionsError ? (
                <p className="text-sm text-destructive">{sessionsError}</p>
              ) : sessions.length ? (
                sessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    isRevoking={revokingSessionId === session.id}
                    onRevoke={onRevokeSession}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-muted">
                  No active sessions are available right now.
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {activeSection === "notifications" && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-ink">
              Notification Preferences
            </h2>
            <p className="text-sm text-slate-muted">
              Choose which updates stay inside TeamForge and which ones should
              also land in your inbox.
            </p>
          </div>

          {(notificationPreferencesMessage || notificationPreferencesError) && (
            <p
              className={`mt-4 text-sm ${notificationPreferencesError ? "text-destructive" : "text-forge-teal"}`}
            >
              {notificationPreferencesError ?? notificationPreferencesMessage}
            </p>
          )}

          <div className="mt-6">
            <h3 className="text-base font-semibold text-ink">
              In-app notifications
            </h3>
            <p className="mt-1 text-sm text-slate-muted">
              These control the bell, drawer, badges, and in-app activity
              surfaces.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {isLoadingNotificationPreferences ? (
              <p className="text-sm text-slate-muted">
                Loading notification preferences...
              </p>
            ) : notificationPreferences ? (
              NOTIFICATION_PREFERENCE_ITEMS.map((item) => (
                <NotificationPreferenceRow
                  key={item.key}
                  checked={notificationPreferences[item.key]}
                  title={item.title}
                  description={item.description}
                  disabled={isSavingNotificationPreferences}
                  onToggle={() => {
                    void onNotificationPreferenceChange(
                      item.key,
                      !notificationPreferences[item.key],
                    );
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-slate-muted">
                We couldn't load your notification preferences right now.
              </p>
            )}
          </div>

          {!isLoadingNotificationPreferences && notificationPreferences && (
            <>
              <div className="mt-8">
                <h3 className="text-base font-semibold text-ink">
                  Email delivery
                </h3>
                <p className="mt-1 text-sm text-slate-muted">
                  These control which alerts TeamForge is allowed to send to
                  your inbox.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {EMAIL_PREFERENCE_ITEMS.map((item) => (
                  <NotificationPreferenceRow
                    key={item.key}
                    checked={notificationPreferences[item.key]}
                    title={item.title}
                    description={item.description}
                    disabled={isSavingNotificationPreferences}
                    onToggle={() => {
                      void onNotificationPreferenceChange(
                        item.key,
                        !notificationPreferences[item.key],
                      );
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
