import { NotificationPreferenceRow } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";
import type { NotificationPreferences } from "@/shared/schemas";

export interface BooleanPreferenceItem {
  key: BooleanSettingsPreferenceKey;
  title: string;
  description: string;
}

interface PreferenceRowListProps {
  items: readonly BooleanPreferenceItem[];
  notificationPreferences: NotificationPreferences;
  disabled: boolean;
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
}

export function PreferenceRowList({
  items,
  notificationPreferences,
  disabled,
  onChange,
}: PreferenceRowListProps) {
  return (
    <>
      {items.map((item) => (
        <NotificationPreferenceRow
          key={item.key}
          checked={notificationPreferences[item.key]}
          title={item.title}
          description={item.description}
          disabled={disabled}
          onToggle={() => {
            void onChange(item.key, !notificationPreferences[item.key]);
          }}
        />
      ))}
    </>
  );
}
