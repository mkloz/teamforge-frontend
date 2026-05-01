import { useState } from "react";

export function useUserMenu() {
  const [open, setOpen] = useState(false);

  return {
    open,
    toggle: () => setOpen((value) => !value),
    close: () => setOpen(false),
  };
}
