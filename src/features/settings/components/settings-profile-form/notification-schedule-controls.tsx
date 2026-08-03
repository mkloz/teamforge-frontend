import { BellRing, Clock3, type LucideIcon, MoonStar } from "lucide-react";
import { type FormEvent, useEffect, useId, useState } from "react";

import { SectionHeading } from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import {
  getBrowserTimeZone,
  getSupportedTimeZones,
  isValidTimeZone,
} from "@/shared/lib/plan-schedule";
import { cn } from "@/shared/lib/utils";
import type { NotificationPreferences } from "@/shared/schemas";

type ScheduleValues = Partial<
  Pick<
    NotificationPreferences,
    | "notificationHardMute"
    | "notificationTimeZoneId"
    | "quietHoursStartMinute"
    | "quietHoursEndMinute"
    | "planReminderLeadMinutes"
  >
>;

interface NotificationScheduleControlsProps {
  disabled: boolean;
  preferences: NotificationPreferences;
  savingPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  onChange: (values: ScheduleValues) => Promise<void>;
}

export function NotificationScheduleControls({
  disabled,
  preferences,
  savingPreferenceKeys,
  onChange,
}: NotificationScheduleControlsProps) {
  const hardMuteId = useId();
  const quietHoursId = useId();
  const browserTimeZone = getBrowserTimeZone();
  const [timeZoneId, setTimeZoneId] = useState(
    preferences.notificationTimeZoneId ?? browserTimeZone,
  );
  const [startTime, setStartTime] = useState(
    minuteToTime(preferences.quietHoursStartMinute ?? 22 * 60),
  );
  const [endTime, setEndTime] = useState(
    minuteToTime(preferences.quietHoursEndMinute ?? 7 * 60),
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const quietHoursEnabled =
    preferences.quietHoursStartMinute !== null &&
    preferences.quietHoursEndMinute !== null;
  const isSavingHardMute = savingPreferenceKeys.has("notificationHardMute");
  const isSavingReminder = savingPreferenceKeys.has("planReminderLeadMinutes");
  const isSavingQuietHours = quietHourKeys.some((key) =>
    savingPreferenceKeys.has(key),
  );

  useEffect(() => {
    setTimeZoneId(preferences.notificationTimeZoneId ?? browserTimeZone);
    setStartTime(minuteToTime(preferences.quietHoursStartMinute ?? 22 * 60));
    setEndTime(minuteToTime(preferences.quietHoursEndMinute ?? 7 * 60));
  }, [browserTimeZone, preferences]);

  async function toggleQuietHours(enabled: boolean) {
    setValidationError(null);
    await onChange({
      notificationTimeZoneId: enabled ? timeZoneId : null,
      quietHoursStartMinute: enabled ? timeToMinute(startTime) : null,
      quietHoursEndMinute: enabled ? timeToMinute(endTime) : null,
    });
  }

  async function saveQuietHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidTimeZone(timeZoneId)) {
      setValidationError(
        "Enter a valid IANA time zone, such as Europe/London.",
      );
      return;
    }
    const startMinute = timeToMinute(startTime);
    const endMinute = timeToMinute(endTime);
    if (startMinute === endMinute) {
      setValidationError("Quiet hours must start and end at different times.");
      return;
    }
    setValidationError(null);
    await onChange({
      notificationTimeZoneId: timeZoneId,
      quietHoursStartMinute: startMinute,
      quietHoursEndMinute: endMinute,
    });
  }

  return (
    <section aria-labelledby={`${quietHoursId}-heading`}>
      <SectionHeading
        headingId={`${quietHoursId}-heading`}
        title="Delivery timing"
        description="Choose when reminders arrive and when routine updates should wait. Important plan changes always get through."
      />

      <GroupedMenuList className="mt-5" aria-label="Notification timing">
        <GroupedMenuItem>
          <ScheduleToggleRow
            checked={preferences.notificationHardMute}
            description="Stop every TeamForge notification on this account until you resume them."
            disabled={disabled || isSavingHardMute}
            icon={MoonStar}
            id={hardMuteId}
            title="Pause all notifications"
            onCheckedChange={(notificationHardMute) => {
              void onChange({ notificationHardMute });
            }}
          />
        </GroupedMenuItem>

        <GroupedMenuItem>
          <div className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_12rem] sm:px-5">
            <BellRing
              aria-hidden="true"
              className="size-5 shrink-0 text-slate-muted"
              strokeWidth={1.5}
            />
            <div className="min-w-0">
              <Label
                htmlFor={`${quietHoursId}-reminder-lead`}
                className="font-semibold text-ink text-sm"
              >
                Starting-soon reminder
              </Label>
              <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
                Sent before a plan you are attending.
              </p>
            </div>
            <Select
              value={String(preferences.planReminderLeadMinutes)}
              disabled={disabled || isSavingReminder}
              onValueChange={(value) => {
                void onChange({
                  planReminderLeadMinutes: parseReminderLeadMinutes(value),
                });
              }}
            >
              <SelectTrigger
                id={`${quietHoursId}-reminder-lead`}
                size="sm"
                className="col-span-2 w-full sm:col-span-1"
                aria-label="Starting-soon reminder time"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_LEAD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GroupedMenuItem>

        <GroupedMenuItem>
          <ScheduleToggleRow
            checked={quietHoursEnabled}
            description="Hold routine updates; cancellations and material plan changes still arrive."
            disabled={disabled || isSavingQuietHours}
            icon={Clock3}
            id={quietHoursId}
            title="Quiet hours"
            onCheckedChange={(checked) => {
              void toggleQuietHours(checked);
            }}
          />
        </GroupedMenuItem>
      </GroupedMenuList>

      {quietHoursEnabled ? (
        <GroupedMenuList className="mt-2" aria-label="Quiet hours schedule">
          <GroupedMenuItem>
            <form
              className="grid gap-4 px-3 py-4 sm:px-5 sm:py-5"
              onSubmit={saveQuietHours}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TimeField
                  id={`${quietHoursId}-start`}
                  label="Starts"
                  value={startTime}
                  disabled={disabled || isSavingQuietHours}
                  onChange={setStartTime}
                />
                <TimeField
                  id={`${quietHoursId}-end`}
                  label="Ends"
                  value={endTime}
                  disabled={disabled || isSavingQuietHours}
                  onChange={setEndTime}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${quietHoursId}-zone`}>Time zone</Label>
                <Input
                  id={`${quietHoursId}-zone`}
                  list={`${quietHoursId}-zones`}
                  value={timeZoneId}
                  disabled={disabled || isSavingQuietHours}
                  autoComplete="off"
                  onChange={(event) => setTimeZoneId(event.target.value)}
                />
                <datalist id={`${quietHoursId}-zones`}>
                  {getSupportedTimeZones().map((zone) => (
                    <option key={zone} value={zone} />
                  ))}
                </datalist>
              </div>
              {validationError ? (
                <p className="text-destructive text-sm" role="alert">
                  {validationError}
                </p>
              ) : null}
              <Button
                type="submit"
                variant="outline"
                size="md"
                className="w-fit"
                loading={isSavingQuietHours}
                disabled={disabled}
              >
                Save quiet hours
              </Button>
            </form>
          </GroupedMenuItem>
        </GroupedMenuList>
      ) : null}
    </section>
  );
}

function ScheduleToggleRow({
  checked,
  description,
  disabled,
  icon: Icon,
  id,
  onCheckedChange,
  title,
}: {
  checked: boolean;
  description: string;
  disabled: boolean;
  icon: LucideIcon;
  id: string;
  onCheckedChange: (checked: boolean) => void;
  title: string;
}) {
  return (
    <GroupedMenuAction
      selected={checked}
      className={cn(
        "min-h-16 gap-3 px-3 py-3 sm:px-5",
        disabled && "cursor-not-allowed opacity-65",
      )}
    >
      <Icon
        aria-hidden="true"
        className="size-5 shrink-0 text-slate-muted"
        strokeWidth={1.5}
      />
      <div className="min-w-0 flex-1">
        <Label
          htmlFor={id}
          className={cn(
            "font-semibold text-ink text-sm",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {title}
        </Label>
        <p
          id={`${id}-description`}
          className="mt-0.5 text-slate-muted text-xs leading-relaxed"
        >
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        aria-describedby={`${id}-description`}
        onCheckedChange={onCheckedChange}
      />
    </GroupedMenuAction>
  );
}

function parseReminderLeadMinutes(value: string): 30 | 60 | 180 | 1440 {
  const minutes = Number(value);
  if (minutes === 30 || minutes === 60 || minutes === 180 || minutes === 1440) {
    return minutes;
  }
  return 60;
}

function TimeField({
  disabled,
  id,
  label,
  onChange,
  value,
}: {
  disabled: boolean;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="time"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

const quietHourKeys = [
  "notificationTimeZoneId",
  "quietHoursStartMinute",
  "quietHoursEndMinute",
] as const satisfies readonly (keyof NotificationPreferences)[];

const REMINDER_LEAD_OPTIONS = [
  { label: "30 minutes before", value: 30 },
  { label: "1 hour before", value: 60 },
  { label: "3 hours before", value: 180 },
  { label: "1 day before", value: 1440 },
] as const;

function minuteToTime(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(
    minute % 60,
  ).padStart(2, "0")}`;
}

function timeToMinute(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
