import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ensureCurrentUser } from "@/shared/api/current-user-query";
import {
  buildPostAuthRedirectNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";

export function useAuthPageNavigation() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { returnTo } = useAuthReturnState();

  const navigateAfterAuth = async () => {
    setProgress(1);
    const user = await ensureCurrentUser();
    await navigate(buildPostAuthRedirectNavigation(user, returnTo));
  };

  return {
    navigate,
    navigateAfterAuth,
    progress,
    returnTo,
    setProgress,
  };
}
