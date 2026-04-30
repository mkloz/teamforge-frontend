import { parseAsBoolean, useQueryState } from "nuqs";

export function useNotificationsDrawerState() {
  const [open, setOpen] = useQueryState(
    "notifications",
    parseAsBoolean.withDefault(false).withOptions({ history: "replace" }),
  );

  return {
    open,
    openDrawer: () => setOpen(true),
    closeDrawer: () => setOpen(false),
  };
}
