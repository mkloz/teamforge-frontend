import { useState } from "react";
import { MOCK_HOME_FEED } from "../data/mock-feed";
import type { HomeFeedData } from "../types/home.types";

// Mock SWR-like hook for home feed data
export function useHomeFeed() {
  const [data] = useState<HomeFeedData>(MOCK_HOME_FEED);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    data,
    isLoading,
    error,
    isValidating: false,
  };
}
