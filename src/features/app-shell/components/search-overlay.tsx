import { cn } from "@/shared/lib/utils";
import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (open) {
      // Slight delay so the transition completes before focus
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-label="Search"
      aria-modal="true"
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col bg-background transition-opacity duration-200",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
    >
      {/* Input row */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <Search size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search activities, people, groups..."
          className={cn(
            "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground",
            "text-base outline-none border-none ring-0",
          )}
          aria-label="Search"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Results area — placeholder for now */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="text-sm text-muted-foreground text-center mt-16">
          Start typing to search activities, people, and groups.
        </p>
      </div>
    </div>
  );
}
