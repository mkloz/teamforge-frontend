import { Clock3, MoonStar } from "lucide-react";
import { type FormEvent, useEffect, useId, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import {
  getBrowserTimeZone,
  getSupportedTimeZones,
  isValidTimeZone,
} from "@/shared/lib/plan-schedule";
import type { NotificationPreferences } from "@/shared/schemas";

type ScheduleValues = Pick<
  NotificationPreferences,
  | "notificationHardMute"
  | "notificationTimeZoneId"
  | "quietHoursStartMinute"
  | "quietHoursEndMinute"
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
  const isSaving = scheduleKeys.some((key) => savingPreferenceKeys.has(key));

  useEffect(() => {
    setTimeZoneId(preferences.notificationTimeZoneId ?? browserTimeZone);
    setStartTime(minuteToTime(preferences.quietHoursStartMinute ?? 22 * 60));
    setEndTime(minuteToTime(preferences.quietHoursEndMinute ?? 7 * 60));
  }, [browserTimeZone, preferences]);

  async function toggleQuietHours(enabled: boolean) {
    setValidationError(null);
    await onChange({
      notificationHardMute: preferences.notificationHardMute,
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
      notificationHardMute: preferences.notificationHardMute,
      notificationTimeZoneId: timeZoneId,
      quietHoursStartMinute: startMinute,
      quietHoursEndMinute: endMinute,
    });
  }

  return (
    <section aria-labelledby={`${quietHoursId}-heading`}>
      <div className="px-1">
        <h2
          id={`${quietHoursId}-heading`}
          className="font-bold text-ink text-xl"
        >
          Delivery timing
        </h2>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          Set a full pause or hold routine updates until your quiet hours end.
          Critical plan changes skip quiet hours.
        </p>
      </div>

      <div className="mt-4 grid gap-4 rounded-xl border border-border/60 bg-background/55 p-4 sm:p-5">
        <div className="flex min-h-12 items-center gap-3">
          <MoonStar className="size-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <Label
              htmlFor={hardMuteId}
              className="font-semibold text-ink text-sm"
            >
              Pause all notifications
            </Label>
            <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
              Nothing new will be delivered until you turn this off.
            </p>
          </div>
          <Switch
            id={hardMuteId}
            checked={preferences.notificationHardMute}
            disabled={disabled || isSaving}
            onCheckedChange={(notificationHardMute) => {
              void onChange({
                notificationHardMute,
                notificationTimeZoneId: preferences.notificationTimeZoneId,
                quietHoursStartMinute: preferences.quietHoursStartMinute,
                quietHoursEndMinute: preferences.quietHoursEndMinute,
              });
            }}
          />
        </div>

        <div className="h-px bg-border/60" />

        <div className="flex min-h-12 items-center gap-3">
          <Clock3 className="size-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <Label
              htmlFor={quietHoursId}
              className="font-semibold text-ink text-sm"
            >
              Quiet hours
            </Label>
            <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
              Routine updates wait; cancellations and material changes do not.
            </p>
          </div>
          <Switch
            id={quietHoursId}
            checked={quietHoursEnabled}
            disabled={disabled || isSaving}
            onCheckedChange={(checked) => {
              void toggleQuietHours(checked);
            }}
          />
        </div>

        {quietHoursEnabled ? (
          <form className="grid gap-4 pt-1" onSubmit={saveQuietHours}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TimeField
                id={`${quietHoursId}-start`}
                label="Starts"
                value={startTime}
                disabled={disabled || isSaving}
                onChange={setStartTime}
              />
              <TimeField
                id={`${quietHoursId}-end`}
                label="Ends"
                value={endTime}
                disabled={disabled || isSaving}
                onChange={setEndTime}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${quietHoursId}-zone`}>Time zone</Label>
              <Input
                id={`${quietHoursId}-zone`}
                list={`${quietHoursId}-zones`}
                value={timeZoneId}
                disabled={disabled || isSaving}
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
              loading={isSaving}
              disabled={disabled}
            >
              Save quiet hours
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  );
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

const scheduleKeys = [
  "notificationHardMute",
  "notificationTimeZoneId",
  "quietHoursStartMinute",
  "quietHoursEndMinute",
] as const satisfies readonly (keyof NotificationPreferences)[];

function minuteToTime(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(
    minute % 60,
  ).padStart(2, "0")}`;
}

function timeToMinute(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
