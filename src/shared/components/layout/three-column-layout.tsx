import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

interface ThreeColumnLayoutProps {
  /** The content for the left list panel (e.g. Chat List) */
  listContent: ReactNode;
  /** The content for the main view (e.g. Chat View or Empty State) */
  mainContent: ReactNode;
  /** The content for the right detail panel (Desktop and Mobile) */
  detailContent?: ReactNode;

  /** Whether an item is selected. Controls mobile list vs main view visibility. */
  hasSelection: boolean;
}

/**
 * A shared responsive wrapper for List-Detail-Panel screens (like Chats and Groups).
 *
 * Mobile (<1024px):
 * - Shows `listContent` if nothing is selected (`!hasSelection`)
 * - Shows `mainContent` if something is selected (`hasSelection`)
 * - `detailContent` is expected to manage its own mobile overlay/sheet logic.
 *
 * Desktop (>=1024px, lg breakpoint):
 * - `listContent` is fixed on the left (w-80 or w-96).
 * - `mainContent` fills the remaining space.
 * - `detailContent` (if provided) sits on the right.
 */
export function ThreeColumnLayout({
  listContent,
  mainContent,
  detailContent,
  hasSelection,
}: ThreeColumnLayoutProps) {
  return (
    <div className="fixed inset-0 top-16 md:left-16 lg:left-60 pb-24 md:pb-0 flex bg-background z-10 transition-[left,padding,margin]">
      {/*
        Left Column (List)
        - Mobile: full width when no selection, hidden when selection
        - Desktop (lg): Fixed 320px (w-80), always visible
        - Desktop Large (xl): Fixed 384px (w-96), always visible
      */}
      <div
        className={cn(
          "shrink-0 border-r border-border bg-background h-full",
          // Mobile visibility
          hasSelection ? "hidden lg:block" : "w-full",
          // Desktop sizing
          "lg:w-80 xl:w-96",
        )}
      >
        {listContent}
      </div>

      {/*
        Middle Column (Main Content)
        - Mobile: hidden when no selection, full width when selection
        - Desktop (lg): always visible, takes up remaining space
      */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 h-full",
          !hasSelection ? "hidden lg:flex" : "flex",
        )}
      >
        {mainContent}
      </div>

      {/* Right Column (Detail Panel) */}
      {detailContent}
    </div>
  );
}
