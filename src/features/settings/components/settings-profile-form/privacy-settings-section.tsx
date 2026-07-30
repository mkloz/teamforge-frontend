import {
  CalendarDays,
  type LucideIcon,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useId } from "react";
import { AccountExportSection } from "@/features/settings/components/settings-profile-form/account-export-section";
import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import type { useAccountExport } from "@/features/settings/hooks/use-account-export";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import type { NotificationPreferences } from "@/shared/schemas";

const PRIVACY_TOGGLE_ITEMS = [
  {
    key: "showAgeOnProfile",
    title: "Show age",
    description: "Let people see your age on your public profile.",
    icon: CalendarDays,
  },
  {
    key: "showGenderOnProfile",
    title: "Show gender",
    description: "Include your gender in your public profile details.",
    icon: UserRound,
  },
  {
    key: "showCityOnProfile",
    title: "Show city",
    description: "Share your city while keeping your exact location private.",
    icon: MapPin,
  },
  {
    key: "showFriendsListOnProfile",
    title: "Show friends",
    description: "Let people see the connections shown on your profile.",
    icon: UsersRound,
  },
] as const satisfies ReadonlyArray<{
  description: string;
  icon: LucideIcon;
  key: keyof Pick<
    NotificationPreferences,
    | "showAgeOnProfile"
    | "showGenderOnProfile"
    | "showCityOnProfile"
    | "showFriendsListOnProfile"
  >;
  title: string;
}>;

interface PrivacySettingsSectionProps {
  accountExport: ReturnType<typeof useAccountExport>;
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  isOnline: boolean;
  onChange: (
    values: Pick<
      NotificationPreferences,
      | "showAgeOnProfile"
      | "showGenderOnProfile"
      | "showCityOnProfile"
      | "showFriendsListOnProfile"
    >,
  ) => Promise<void>;
}

export function PrivacySettingsSection({
  accountExport,
  notificationPreferences,
  isLoadingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  isOnline,
  onChange,
}: PrivacySettingsSectionProps) {
  const isDisabled =
    !isOnline || isLoadingNotificationPreferences || !notificationPreferences;

  return (
    <div className="flex flex-col gap-10">
      <PreferenceStatusMessage error={error} />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing profile privacy." />
      ) : null}

      <section>
        <div className="px-1">
          <h2 className="font-bold text-ink text-xl">What people can see</h2>
          <p className="mt-1 max-w-2xl text-slate-muted text-sm leading-relaxed">
            Choose which details appear on your public profile. Hidden details
            can still help TeamForge form groups.
          </p>
        </div>

        {isLoadingNotificationPreferences ? (
          <PrivacyPreferencesSkeleton />
        ) : notificationPreferences ? (
          <GroupedMenuList
            aria-label="Public profile visibility"
            className="mt-5"
          >
            {PRIVACY_TOGGLE_ITEMS.map((item) => (
              <GroupedMenuItem key={item.key}>
                <PrivacyPreferenceRow
                  checked={notificationPreferences[item.key]}
                  disabled={
                    isDisabled || savingNotificationPreferenceKeys.has(item.key)
                  }
                  item={item}
                  onToggle={() => {
                    void onChange({
                      showAgeOnProfile:
                        notificationPreferences.showAgeOnProfile,
                      showGenderOnProfile:
                        notificationPreferences.showGenderOnProfile,
                      showCityOnProfile:
                        notificationPreferences.showCityOnProfile,
                      showFriendsListOnProfile:
                        notificationPreferences.showFriendsListOnProfile,
                      [item.key]: !notificationPreferences[item.key],
                    });
                  }}
                />
              </GroupedMenuItem>
            ))}
          </GroupedMenuList>
        ) : (
          <p className="mt-4 px-1 text-slate-muted text-sm">
            Profile privacy settings are unavailable right now.
          </p>
        )}
      </section>

      <AccountExportSection state={accountExport} />
    </div>
  );
}

function PrivacyPreferenceRow({
  checked,
  disabled,
  item,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  item: (typeof PRIVACY_TOGGLE_ITEMS)[number];
  onToggle: () => void;
}) {
  const switchId = useId();
  const ItemIcon = item.icon;

  return (
    <GroupedMenuAction
      selected={checked}
      className={cn(
        "min-h-14 gap-3 px-3 py-2 sm:min-h-16 sm:px-5 sm:py-3",
        disabled && "cursor-not-allowed opacity-65",
      )}
    >
      <ItemIcon
        aria-hidden="true"
        className={cn(
          "size-5 shrink-0",
          checked ? "text-primary" : "text-slate-muted",
        )}
        strokeWidth={1.5}
      />
      <div className="min-w-0 flex-1">
        <Label
          htmlFor={switchId}
          className={cn(
            "font-semibold text-ink text-sm",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {item.title}
        </Label>
        <p
          id={`${switchId}-description`}
          className="mt-0.5 text-slate-muted text-xs leading-relaxed"
        >
          {item.description}
        </p>
      </div>
      <Switch
        id={switchId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
        aria-describedby={`${switchId}-description`}
        className="shrink-0"
      />
    </GroupedMenuAction>
  );
}

function PrivacyPreferencesSkeleton() {
  return (
    <GroupedMenuList aria-busy="true" className="mt-5">
      <output className="sr-only">Loading privacy settings</output>
      {["age", "gender", "city", "friends"].map((item) => (
        <GroupedMenuItem key={item}>
          <div className="flex min-h-14 items-center gap-3 px-3 py-2 sm:min-h-16 sm:px-5 sm:py-3">
            <Skeleton className="size-5 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-4/5 max-w-72" />
            </div>
            <Skeleton className="h-7 w-12 shrink-0 rounded-full" />
          </div>
        </GroupedMenuItem>
      ))}
    </GroupedMenuList>
  );
}
