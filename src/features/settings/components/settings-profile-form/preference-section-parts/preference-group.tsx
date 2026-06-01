import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";
import { SettingsPreferencesSkeleton } from "@/features/settings/components/settings-section-skeletons";
import type { NotificationPreferences } from "@/shared/schemas";
import {
  type BooleanPreferenceItem,
  PreferenceRowList,
} from "./preference-row-list";

interface PreferenceGroupProps {
  title: string;
  description: string;
  items: readonly BooleanPreferenceItem[];
  notificationPreferences: NotificationPreferences | null;
  isLoading?: boolean;
  disabled?: boolean;
  savingPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  emptyMessage: string;
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
}

export function PreferenceGroup({
  title,
  description,
  items,
  notificationPreferences,
  isLoading = false,
  disabled = false,
  savingPreferenceKeys,
  emptyMessage,
  onChange,
}: PreferenceGroupProps) {
  return (
    <>
      <div>
        <h3 className="font-semibold text-base text-ink">{title}</h3>
        <p className="mt-1 text-slate-muted text-sm">{description}</p>
      </div>

      <div className="border-border border-t">
        {isLoading ? (
          <SettingsPreferencesSkeleton />
        ) : notificationPreferences ? (
          <PreferenceRowList
            items={items}
            notificationPreferences={notificationPreferences}
            disabled={disabled}
            savingPreferenceKeys={savingPreferenceKeys}
            onChange={onChange}
          />
        ) : (
          <div className="flex min-h-32 items-center justify-center py-4 text-center">
            <p className="text-slate-muted text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </>
  );
}
