import { useEffect, useRef, useState } from "react";

/**
 * useHeaderSearch - Manages search state, focus, and cleanup for the chat header.
 */
export function useHeaderSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearching) {
      // Small timeout to ensure the element is painted before focusing
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [isSearching]);

  function toggleSearch(state: boolean) {
    setIsSearching(state);
    if (!state) {
      setSearchQuery("");
    }
  }

  return {
    isSearching,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    toggleSearch,
  };
}
