import { useState, useEffect } from "react";
import type { UserProfile } from "../types/profile.types";
import { MOCK_PROFILE } from "../data/mock-profile";

/**
 * Custom hook to manage user profile data.
 * Currently returns mock data, but is structured to easily integrate
 * with future API or global state management (e.g., TanStack Query).
 */
export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API fetch delay
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Simulate a tiny delay for realism
        await new Promise((resolve) => setTimeout(resolve, 300));

        // In the future, this would be:
        // const response = await fetch(`/api/profile/${userId}`);
        // setProfile(await response.json());

        setProfile(MOCK_PROFILE);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch profile"),
        );
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, isLoading, error };
}
