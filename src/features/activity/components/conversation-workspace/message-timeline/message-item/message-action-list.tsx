import { ActivityMenuIcon } from "@/features/activity/components/activity-menu-icon";
import {
  ACTIVITY_MENU_ITEM_CLASS,
  ACTIVITY_MENU_SEPARATOR_CLASS,
  getActivityMenuContentClass,
} from "@/features/activity/components/activity-popup-styles";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/shared/components/ui/context-menu";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { cn } from "@/shared/lib/utils";
import type { MessageActionItem } from "./message-action-menu-state";

const MENU_CARD_CLASS = getActivityMenuContentClass("w-full");

const MENU_SEPARATOR_CLASS = ACTIVITY_MENU_SEPARATOR_CLASS;

const MENU_ACTION_CLASS = cn(ACTIVITY_MENU_ITEM_CLASS, "text-sm");

const MENU_DANGER_CLASS =
  "text-destructive focus:bg-destructive/8 focus:text-destructive data-[highlighted]:bg-destructive/8 data-[highlighted]:text-destructive";

export function MessageActionSections({
  dangerActions,
  primaryActions,
}: {
  dangerActions: MessageActionItem[];
  primaryActions: MessageActionItem[];
}) {
  return (
    <div className={MENU_CARD_CLASS}>
      <MessageActionList actions={primaryActions} />
      {dangerActions.length > 0 && (
        <>
          <ContextMenuSeparator className={MENU_SEPARATOR_CLASS} />
          <MessageActionList actions={dangerActions} />
        </>
      )}
    </div>
  );
}

function MessageActionList({ actions }: { actions: MessageActionItem[] }) {
  return (
    <>
      {actions.map((action) => (
        <ContextMenuItem
          key={action.id}
          className={cn(
            MENU_ACTION_CLASS,
            action.tone === "danger" && MENU_DANGER_CLASS,
          )}
          onSelect={() => {
            void Promise.resolve(action.onSelect()).catch(
              showMessageActionError,
            );
          }}
        >
          <MessageActionRow action={action} />
        </ContextMenuItem>
      ))}
    </>
  );
}

function MessageActionRow({ action }: { action: MessageActionItem }) {
  const Icon = action.icon;

  return (
    <>
      <ActivityMenuIcon tone={action.tone === "danger" ? "danger" : "default"}>
        <Icon className="size-4" />
      </ActivityMenuIcon>
      <span className="min-w-0 flex-1 truncate font-bold text-xs">
        {action.label}
      </span>
    </>
  );
}

function showMessageActionError(error: unknown) {
  showAppErrorToast(error, {
    fallbackMessage: "That message action didn't go through.",
  });
}
