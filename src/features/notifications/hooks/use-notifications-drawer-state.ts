import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

export function useNotificationsDrawerState() {
  const [urlOpen, setUrlOpen] = useQueryState(
    "notifications",
    parseAsBoolean.withDefault(false).withOptions({ history: "replace" }),
  );
  const [open, setOpen] = useState(urlOpen);

  useEffect(() => {
    setOpen(urlOpen);
  }, [urlOpen]);

  return {
    open,
    openDrawer: () => {
      setOpen(true);

      return setUrlOpen(true);
    },
    closeDrawer: () => {
      setOpen(false);

      return setUrlOpen(false);
    },
  };
}
