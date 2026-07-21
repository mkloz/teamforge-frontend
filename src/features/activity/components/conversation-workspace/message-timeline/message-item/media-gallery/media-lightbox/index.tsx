import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import type { ReactNode } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
} from "@/shared/components/ui/dialog";
import { LightboxHeader } from "./lightbox-header";
import { LightboxStage } from "./lightbox-stage";
import { ThumbnailStrip } from "./thumbnail-strip";
import { useLightboxNavigation } from "./use-lightbox-navigation";

interface MediaLightboxProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: UnifiedAttachment[];
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
}

export function MediaLightbox({
  isOpen,
  onOpenChange,
  attachments,
  selectedIndex,
  setSelectedIndex,
}: MediaLightboxProps) {
  const { count, currentMedia, handleNext, handlePrev } = useLightboxNavigation(
    {
      attachments,
      selectedIndex,
      setSelectedIndex,
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <LightboxDialogContent>
        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="popLayout">
            <m.div
              key="lightbox-container"
              className="relative flex size-full flex-col"
            >
              <LightboxHeader
                count={count}
                currentMedia={currentMedia}
                selectedIndex={selectedIndex}
              />

              <LightboxStage
                count={count}
                currentMedia={currentMedia}
                onNext={handleNext}
                onPrev={handlePrev}
              />

              {count > 1 && (
                <ThumbnailStrip
                  attachments={attachments}
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                />
              )}
            </m.div>
          </AnimatePresence>
        </LazyMotion>
      </LightboxDialogContent>
    </Dialog>
  );
}

function LightboxDialogContent({ children }: { children: ReactNode }) {
  return (
    <DialogPortal>
      <DialogOverlay className="bg-black/70 backdrop-blur-md" />
      <DialogPrimitive.Content className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 flex h-dvh w-full max-w-full flex-col overflow-hidden border-none bg-black/98 p-0 text-white opacity-0 shadow-none outline-none backdrop-blur-3xl duration-150 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=open]:opacity-100 motion-reduce:animate-none">
        <DialogPrimitive.Title className="sr-only">
          Media preview
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">
          View shared images and videos from this message.
        </DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
