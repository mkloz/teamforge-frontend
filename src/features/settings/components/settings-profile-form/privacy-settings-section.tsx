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
  SectionHeading,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { ReputationCorrectionSection } from "@/features/settings/components/settings-profile-form/reputation-correction-section";
import type { useAccountExport } from "@/features/settings/hooks/use-account-export";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
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

interface PrivacyPreferenceItem {
  description: string;
  icon: LucideIcon;
  title: string;
}

interface PrivacySettingsSectionProps {
  accountExport: ReturnType<typeof useAccountExport>;
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  isOnline: boolean;
  onChange: (
    values: Partial<
      Pick<
        NotificationPreferences,
        | "showAgeOnProfile"
        | "showGenderOnProfile"
        | "showCityOnProfile"
        | "showFriendsListOnProfile"
        | "presencePrecision"
        | "presenceFriendsVisible"
        | "presenceGroupsVisible"
        | "presencePlanGuestsVisible"
      >
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
        <SectionHeading
          title="What people can see"
          description="Choose which details appear on your public profile. Hidden details can still help Findafew form groups."
        />

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

      {isLoadingNotificationPreferences ? (
        <PresencePrivacySkeleton />
      ) : (
        <PresencePrivacySection
          disabled={isDisabled}
          preferences={notificationPreferences}
          savingKeys={savingNotificationPreferenceKeys}
          onChange={onChange}
        />
      )}

      <ReputationCorrectionSection />

      <AccountExportSection state={accountExport} />
    </div>
  );
}

const PRESENCE_PRECISION_OPTIONS = [
  {
    value: "HIDDEN",
    label: "Hidden",
    description: "People see “Last seen hidden”, never an offline guess.",
  },
  {
    value: "APPROXIMATE",
    label: "Approximate",
    description: "Show broad labels such as recently, today or this week.",
  },
  {
    value: "EXACT",
    label: "Exact",
    description: "Share your exact last-seen time with allowed audiences.",
  },
] as const;

const PRESENCE_AUDIENCES = [
  {
    key: "presenceFriendsVisible",
    label: "Friends",
    description: "People you have accepted as friends.",
    icon: UserRound,
  },
  {
    key: "presenceGroupsVisible",
    label: "Shared groups",
    description: "Current members of groups you share.",
    icon: UsersRound,
  },
  {
    key: "presencePlanGuestsVisible",
    label: "Current plan participants",
    description: "Members or guests on the same active plan.",
    icon: CalendarDays,
  },
] as const;

function PresencePrivacySection({
  disabled,
  preferences,
  savingKeys,
  onChange,
}: {
  disabled: boolean;
  preferences: NotificationPreferences | null;
  savingKeys: ReadonlySet<keyof NotificationPreferences>;
  onChange: PrivacySettingsSectionProps["onChange"];
}) {
  if (!preferences) return null;

  const presenceHidden = preferences.presencePrecision === "HIDDEN";

  return (
    <section aria-labelledby="presence-privacy-heading">
      <SectionHeading
        headingId="presence-privacy-heading"
        title="Presence and last seen"
        description="Control how precisely your activity is shown and which people may see it. Presence never signals that you want to chat."
      />

      <div className="mt-5 px-1">
        <h3 className="font-semibold text-ink text-sm">Last-seen detail</h3>
        <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
          This applies everywhere your presence is shown.
        </p>
      </div>

      <RadioGroup
        className="mt-3 gap-0"
        disabled={disabled || savingKeys.has("presencePrecision")}
        value={preferences.presencePrecision}
        onValueChange={(value) => {
          const selected = PRESENCE_PRECISION_OPTIONS.find(
            (option) => option.value === value,
          );
          if (selected) {
            void onChange({ presencePrecision: selected.value });
          }
        }}
      >
        <GroupedMenuList aria-label="Last-seen detail">
          {PRESENCE_PRECISION_OPTIONS.map((option) => {
            const controlId = `presence-precision-${option.value.toLowerCase()}`;
            const selected = preferences.presencePrecision === option.value;

            return (
              <GroupedMenuItem key={option.value}>
                <GroupedMenuAction asChild selected={selected}>
                  <Label
                    htmlFor={controlId}
                    className={cn(
                      "min-h-16 cursor-pointer gap-3 px-3 py-3 sm:px-5",
                      disabled && "cursor-not-allowed opacity-65",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink text-sm">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-slate-muted text-xs leading-relaxed">
                        {option.description}
                      </span>
                    </span>
                    <RadioGroupItem id={controlId} value={option.value} />
                  </Label>
                </GroupedMenuAction>
              </GroupedMenuItem>
            );
          })}
        </GroupedMenuList>
      </RadioGroup>

      <div className="mt-6 px-1">
        <h3 className="font-semibold text-ink text-sm">Who can see it</h3>
        <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
          {presenceHidden
            ? "Hidden overrides every audience below. Your choices are kept if you share again later."
            : "Only the audiences you allow can see your selected level of detail."}
        </p>
      </div>

      <GroupedMenuList aria-label="Presence audiences" className="mt-3">
        {PRESENCE_AUDIENCES.map((audience) => (
          <GroupedMenuItem key={audience.key}>
            <PrivacyPreferenceRow
              checked={preferences[audience.key]}
              disabled={
                disabled || presenceHidden || savingKeys.has(audience.key)
              }
              item={{
                description: audience.description,
                icon: audience.icon,
                title: audience.label,
              }}
              onToggle={() =>
                void onChange({ [audience.key]: !preferences[audience.key] })
              }
            />
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
    </section>
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
  item: PrivacyPreferenceItem;
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
        className="size-5 shrink-0 text-slate-muted"
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

function PresencePrivacySkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading presence privacy settings">
      <div className="px-1">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="mt-2 h-3.5 w-full max-w-md" />
      </div>
      <GroupedMenuList className="mt-5">
        {["hidden", "approximate", "exact"].map((option) => (
          <GroupedMenuItem key={option}>
            <div className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-5">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-4/5 max-w-72" />
              </div>
              <Skeleton className="size-4 shrink-0 rounded-full" />
            </div>
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
    </section>
  );
}
