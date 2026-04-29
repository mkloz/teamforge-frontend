import { AuthQueries } from "@/features/auth/api/auth.queries";

import { HomeQueries } from "../api/home.queries";

export function useHomeViewer() {
  const { data: currentUser } = AuthQueries.useCurrentUser();

  return HomeQueries.getViewer(currentUser);
}
