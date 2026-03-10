import { useState } from "react";
import type { SearchStatus } from "../types/home.types";

export function useSearchMode(initialStatus: SearchStatus = "IDLE") {
  const [searchStatus, setSearchStatus] = useState<SearchStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleSearchMode = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call to update search status
      const newStatus: SearchStatus = searchStatus === "IDLE" ? "SEARCHING" : "IDLE";
      // await api.updateSearchStatus(newStatus);
      setSearchStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    searchStatus,
    isUpdating,
    toggleSearchMode,
  };
}
