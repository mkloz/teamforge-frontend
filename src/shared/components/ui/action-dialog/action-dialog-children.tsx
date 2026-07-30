import type { ReactNode } from "react";

export function ActionDialogChildren({ children }: { children: ReactNode }) {
  return children ? <div className="px-5 pb-4 sm:px-6">{children}</div> : null;
}
