import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ensureCurrentUser } from "@/shared/api/current-user-query";
import { ensureOnboardingProductState } from "@/shared/api/onboarding-product-state-query";
import {
  buildPostAuthRedirectNavigationForDestination,
  useAuthReturnState,
} from "@/shared/lib/auth-route";
import {
  getPostAuthRedirectPath,
  getProductStateRedirectPath,
} from "@/shared/lib/post-auth-route";

export function useAuthPageNavigation() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { returnTo } = useAuthReturnState();

  const navigateAfterAuth = async () => {
    setProgress(1);
    let destination:
      | ReturnType<typeof getPostAuthRedirectPath>
      | ReturnType<typeof getProductStateRedirectPath> = "/onboarding/profile";

    try {
      const productState = await ensureOnboardingProductState();
      destination = getProductStateRedirectPath(productState);
    } catch {
      // Email verification has already succeeded at this point. Falling back
      // prevents a transient projection request from stranding the user on an
      // already-consumed OTP screen.
      try {
        destination = getPostAuthRedirectPath(await ensureCurrentUser());
      } catch {
        destination = "/onboarding/profile";
      }
    }

    await navigate(
      buildPostAuthRedirectNavigationForDestination(destination, returnTo),
    );
  };

  return {
    navigate,
    navigateAfterAuth,
    progress,
    returnTo,
    setProgress,
  };
}
