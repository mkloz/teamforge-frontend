import { useEffect, useRef, useState } from "react";

interface UseHeaderSearchOptions {
  onClose?: () => void;
}

/**
 * useHeaderSearch - Manages search state, focus, and cleanup for the chat header.
 */
export function useHeaderSearch({ onClose }: UseHeaderSearchOptions = {}) {
  const [isSearching, setIsSearching] = useState(false);
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
      onClose?.();
    }
  }

  return {
    isSearching,
    searchInputRef,
    toggleSearch,
  };
}
