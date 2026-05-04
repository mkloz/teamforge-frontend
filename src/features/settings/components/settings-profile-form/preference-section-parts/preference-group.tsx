import {
  PreferenceRowList,
  type BooleanPreferenceItem,
} from "./preference-row-list";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";
import type { NotificationPreferences } from "@/shared/schemas";

interface PreferenceGroupProps {
  title: string;
  description: string;
  items: readonly BooleanPreferenceItem[];
  notificationPreferences: NotificationPreferences | null;
  isLoading?: boolean;
  isSaving: boolean;
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
  isSaving,
  emptyMessage,
  onChange,
}: PreferenceGroupProps) {
  return (
    <>
      <div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-slate-muted">{description}</p>
      </div>

      <div className="border-t border-border">
        {isLoading ? (
          <p className="py-4 text-sm text-slate-muted">
            Loading notification preferences...
          </p>
        ) : notificationPreferences ? (
          <PreferenceRowList
            items={items}
            notificationPreferences={notificationPreferences}
            disabled={isSaving}
            onChange={onChange}
          />
        ) : (
          <p className="py-4 text-sm text-slate-muted">{emptyMessage}</p>
        )}
      </div>
    </>
  );
}
