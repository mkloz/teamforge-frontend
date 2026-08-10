import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Component,
  type ErrorInfo,
  type KeyboardEvent,
  lazy,
  type ReactNode,
  type RefObject,
  Suspense,
  useRef,
} from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGifAttachment } from "@/features/activity/lib/gif-attachments";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
} from "@/shared/components/ui/dialog";
import { captureException } from "@/shared/lib/telemetry";
import { LightboxHeader } from "./lightbox-header";
import { useLightboxNavigation } from "./use-lightbox-navigation";

const LightboxContent = lazy(() =>
  import("./lightbox-content").then((module) => ({
    default: module.LightboxContent,
  })),
);

interface MediaLightboxProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: UnifiedAttachment[];
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  focusFallbackRef?: RefObject<HTMLElement | null>;
  returnFocusTargetRef?: RefObject<HTMLElement | null>;
}

export function MediaLightbox({
  isOpen,
  onOpenChange,
  attachments,
  selectedIndex,
  setSelectedIndex,
  focusFallbackRef: providedFocusFallbackRef,
  returnFocusTargetRef,
}: MediaLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const localFocusFallbackRef = useRef<HTMLElement | null>(null);
  const focusSourceRef = useRef<HTMLElement | null>(null);
  const focusFallbackRef = providedFocusFallbackRef ?? localFocusFallbackRef;
  const navigation = useLightboxNavigation({
    attachments,
    isOpen,
    selectedIndex,
    setSelectedIndex,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <LightboxDialogContent
        closeButtonRef={closeButtonRef}
        focusFallbackRef={focusFallbackRef}
        focusSourceRef={focusSourceRef}
        returnFocusTargetRef={returnFocusTargetRef}
        onKeyDown={navigation.handleKeyDown}
        description={getLightboxDialogDescription(
          navigation.currentMedia,
          navigation.currentIndex,
          navigation.count,
        )}
      >
        <div className="relative flex size-full flex-col">
          <LightboxHeader
            closeButtonRef={closeButtonRef}
            count={navigation.count}
            currentMedia={navigation.currentMedia}
            selectedIndex={navigation.currentIndex}
          />

          <p
            aria-atomic="true"
            aria-live="polite"
            className="sr-only"
            role="status"
          >
            {navigation.announcement}
          </p>

          <LightboxContentBoundary>
            <Suspense fallback={<LightboxContentPending />}>
              <LightboxContent
                attachments={attachments}
                currentIndex={navigation.currentIndex}
                currentMedia={navigation.currentMedia}
                direction={navigation.direction}
                isNextDisabled={navigation.isNextDisabled}
                isPreviousDisabled={navigation.isPreviousDisabled}
                onNext={navigation.goNext}
                onPrevious={navigation.goPrevious}
                onSelect={navigation.selectIndex}
              />
            </Suspense>
          </LightboxContentBoundary>
        </div>
      </LightboxDialogContent>
    </Dialog>
  );
}

function LightboxDialogContent({
  children,
  closeButtonRef,
  description,
  focusFallbackRef,
  focusSourceRef,
  returnFocusTargetRef,
  onKeyDown,
}: {
  children: ReactNode;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  description: string;
  focusFallbackRef: RefObject<HTMLElement | null>;
  focusSourceRef: RefObject<HTMLElement | null>;
  returnFocusTargetRef?: RefObject<HTMLElement | null>;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
  return (
    <DialogPortal>
      <DialogOverlay className="bg-black/70 backdrop-blur-md" />
      <DialogPrimitive.Content
        onKeyDown={onKeyDown}
        onOpenAutoFocus={(event) => {
          const explicitSource = returnFocusTargetRef?.current;
          const activeSource =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          const source = explicitSource?.isConnected
            ? explicitSource
            : activeSource;
          focusSourceRef.current = source;
          if (!focusFallbackRef.current) {
            focusFallbackRef.current =
              source?.closest<HTMLElement>(
                "[data-media-gallery-focus-fallback]",
              ) ?? null;
          }
          event.preventDefault();
          closeButtonRef.current?.focus({ preventScroll: true });
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          const source = focusSourceRef.current;
          const fallback = focusFallbackRef.current;
          const target = source?.isConnected
            ? source
            : fallback?.isConnected
              ? fallback
              : document.querySelector<HTMLElement>("#main-content");
          target?.focus({ preventScroll: true });
          focusSourceRef.current = null;
          if (returnFocusTargetRef) {
            returnFocusTargetRef.current = null;
          }
        }}
        className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 flex h-dvh w-full max-w-full flex-col overflow-hidden border-none bg-black/98 p-0 text-white opacity-0 shadow-none outline-none backdrop-blur-3xl duration-150 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=open]:opacity-100 motion-reduce:animate-none"
      >
        <DialogPrimitive.Title className="sr-only">
          Media preview
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">
          {description}
        </DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function getLightboxDialogDescription(
  media: UnifiedAttachment | null,
  selectedIndex: number | null,
  count: number,
) {
  const position = selectedIndex ?? 0;
  const type = media
    ? isGifAttachment(media)
      ? "GIF"
      : media.type === "VIDEO"
        ? "Video"
        : "Image"
    : "Media";
  const name = media?.name ? `: ${media.name}` : "";

  return `Viewing ${type} ${position + 1} of ${count}${name}. Use the visible controls to move between attachments.`;
}

function LightboxContentPending() {
  return (
    <div
      aria-label="Loading media viewer"
      className="flex flex-1 items-center justify-center text-sm text-white/65"
      role="status"
    >
      Loading media…
    </div>
  );
}

class LightboxContentBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException("activity.media-lightbox.content", error, {
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p role="alert" className="text-sm text-white/75">
            The media viewer could not load. Close it and try again.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
