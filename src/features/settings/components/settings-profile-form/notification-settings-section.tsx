import { BellOff, BellRing, Send } from "lucide-react";
import { useId } from "react";

import {
  PreferenceGroup,
  PreferenceStatusMessage,
  SectionHeading,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";
import {
  EMAIL_PREFERENCE_ITEMS,
  NOTIFICATION_PREFERENCE_ITEMS,
} from "@/features/settings/components/settings-profile-form/settings-preference-items";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";
import { cn } from "@/shared/lib/utils";
import type { NotificationPreferences } from "@/shared/schemas";

interface NotificationSettingsSectionProps {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
}

export function NotificationSettingsSection({
  notificationPreferences,
  isLoadingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  onChange,
}: NotificationSettingsSectionProps) {
  const shouldShowEmailDelivery =
    !isLoadingNotificationPreferences && notificationPreferences;

  return (
    <section className="flex flex-col gap-8">
      <SectionHeading
        title="Notification preferences"
        description="Choose which updates stay inside TeamForge and which ones should also land in your inbox."
      />

      <PreferenceStatusMessage error={error} />

      <WebPushDevicePreference />

      <PreferenceGroup
        title="In-app notifications"
        description="These control the bell, drawer, badges, and in-app activity surfaces."
        items={NOTIFICATION_PREFERENCE_ITEMS}
        notificationPreferences={notificationPreferences}
        isLoading={isLoadingNotificationPreferences}
        savingPreferenceKeys={savingNotificationPreferenceKeys}
        emptyMessage="We couldn't load your notification preferences right now."
        onChange={onChange}
      />

      {shouldShowEmailDelivery && (
        <PreferenceGroup
          title="Email delivery"
          description="These control which alerts TeamForge is allowed to send to your inbox."
          items={EMAIL_PREFERENCE_ITEMS}
          notificationPreferences={notificationPreferences}
          savingPreferenceKeys={savingNotificationPreferenceKeys}
          emptyMessage="We couldn't load your email preferences right now."
          onChange={onChange}
        />
      )}
    </section>
  );
}

type WebPushDeviceState = ReturnType<typeof useWebPushSubscription>;

function getWebPushDeviceStatus(push: WebPushDeviceState) {
  if (!push.support.isSupported) {
    return {
      label: "Unavailable",
      description: "This browser cannot receive TeamForge push notifications.",
      tone: "muted",
    } as const;
  }

  if (!push.isAuthenticated) {
    return {
      label: "Sign in needed",
      description: "Sign in before turning on push notifications.",
      tone: "muted",
    } as const;
  }

  if (push.isPublicKeyLoading) {
    return {
      label: "Checking",
      description: "Checking whether this TeamForge environment can send push.",
      tone: "muted",
    } as const;
  }

  if (!push.isWebPushEnabled) {
    return {
      label: "Not enabled",
      description:
        "Push delivery is not enabled for this TeamForge environment yet.",
      tone: "muted",
    } as const;
  }

  if (push.permission === "denied") {
    return {
      label: "Blocked",
      description:
        "Notifications are blocked in this browser. Turn them back on in site settings.",
      tone: "attention",
    } as const;
  }

  if (push.isSubscribed) {
    return {
      label: "On",
      description:
        "This device can show group invites, messages, and plan updates outside the app.",
      tone: "on",
    } as const;
  }

  if (push.browserEndpoint) {
    return {
      label: "Ready",
      description:
        "This browser already has permission. Turn it on to reconnect this device.",
      tone: "attention",
    } as const;
  }

  return {
    label: "Off",
    description:
      "Turn this on to let TeamForge notify this device when something needs your attention.",
    tone: "muted",
  } as const;
}

function WebPushDevicePreference() {
  const switchId = useId();
  const push = useWebPushSubscription();
  const status = getWebPushDeviceStatus(push);
  const StatusIcon = push.isSubscribed ? BellRing : BellOff;
  const isBusy =
    push.isTurningOn || push.isTurningOff || push.isCheckingBrowserSubscription;
  const canToggle = push.isSubscribed || push.canRequestPermission;
  const isDisabled = isBusy || push.isPublicKeyLoading || !canToggle;

  async function handleToggle(checked: boolean) {
    if (checked) {
      await push.turnOn("settings");
      return;
    }

    await push.turnOff("settings");
  }

  return (
    <>
      <div>
        <h3 className="font-semibold text-base text-ink">Device delivery</h3>
        <p className="mt-1 text-slate-muted text-sm">
          Control whether this browser can show TeamForge alerts outside the
          app.
        </p>
      </div>

      <div className="border-border border-t">
        <div
          className={cn(
            "flex w-full flex-col gap-4 border-border border-b py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between",
            push.isSubscribed && "border-forge-teal/20",
            isDisabled && "opacity-80",
          )}
        >
          <div className="flex min-w-0 gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full",
                push.isSubscribed
                  ? "bg-forge-teal/10 text-forge-teal"
                  : "bg-slate-muted/10 text-slate-muted",
              )}
            >
              <StatusIcon size={18} strokeWidth={2} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Label
                  htmlFor={switchId}
                  className="font-semibold text-ink text-sm"
                >
                  Push notifications
                </Label>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-semibold text-xs",
                    status.tone === "on" && "bg-forge-teal/10 text-forge-teal",
                    status.tone === "attention" &&
                      "bg-spark-amber/15 text-spark-amber",
                    status.tone === "muted" &&
                      "bg-slate-muted/10 text-slate-muted",
                  )}
                >
                  {status.label}
                </span>
              </div>
              <p
                id={`${switchId}-description`}
                className="mt-1 text-slate-muted text-xs leading-relaxed"
              >
                {status.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
            {push.isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                loading={push.isSendingTest}
                disabled={isBusy}
                onClick={() => {
                  void push.sendTest("settings");
                }}
              >
                <Send size={16} strokeWidth={2} aria-hidden="true" />
                Send test
              </Button>
            )}

            <Switch
              id={switchId}
              checked={push.isSubscribed}
              disabled={isDisabled}
              onCheckedChange={(checked) => {
                void handleToggle(checked);
              }}
              aria-describedby={`${switchId}-description`}
              aria-label="Push notifications"
            />
          </div>
        </div>
      </div>
    </>
  );
}
