import { useEffect, useState } from "react";
import type { ProfileInsightModel } from "@/features/profile/lib/profile-insights";
import { getUserOceanScores } from "@/shared/lib/user-psychometrics";
import type { User } from "@/shared/schemas";

function loadProfileInsightsModule() {
  return import("@/features/profile/lib/profile-insights");
}

export function useProfileInsights(profile: User) {
  const [state, setState] = useState<{
    profileId: User["id"];
    profileInsights: ProfileInsightModel | null;
  }>(() => ({
    profileId: profile.id,
    profileInsights: null,
  }));

  useEffect(() => {
    let isStale = false;

    void loadProfileInsightsModule()
      .then(({ buildProfileInsights }) =>
        buildProfileInsights(profile, getUserOceanScores(profile)),
      )
      .catch(() => null)
      .then((profileInsights) => {
        if (!isStale) {
          setState({ profileId: profile.id, profileInsights });
        }

        return undefined;
      });

    return () => {
      isStale = true;
    };
  }, [profile]);

  return state.profileId === profile.id ? state.profileInsights : null;
}
