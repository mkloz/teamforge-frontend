import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Send, Trash2 } from "lucide-react";
import { memo } from "react";

interface ActionTargetProps {
  hasContent: boolean;
  isRecording: boolean;
  onSend: () => void;
  onCancelRecording: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled: boolean;
}

export const ActionTarget = memo(
  ({
    hasContent,
    isRecording,
    onSend,
    onCancelRecording,
    onStartRecording,
    onStopRecording,
    disabled,
  }: ActionTargetProps) => (
    <AnimatePresence mode="popLayout">
      {hasContent ? (
        <motion.div
          key="send"
          initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 15 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            onClick={onSend}
            disabled={disabled}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-full bg-forge-teal text-white shadow-md hover:bg-forge-teal/90 active:scale-95"
            aria-label="Send message"
          >
            <Send size={18} strokeWidth={2.5} className="ml-0.5" />
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="mic"
          initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: -15 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="flex items-center gap-2"
        >
          {/* Cancel / trash — only visible while recording */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.5, width: 0 }}
                className="overflow-hidden"
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onCancelRecording}
                  className="h-11 w-11 shrink-0 text-red-500 hover:text-white border-red-500/20 hover:bg-red-500 rounded-full bg-card/60"
                  aria-label="Cancel recording"
                >
                  <Trash2 size={20} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/*
           * Mic button — press-and-hold to record.
           *
           * Mobile fix: touch events don't fire mouse events reliably.
           * We attach BOTH sets so the same button works on desktop (mouse)
           * and mobile (touch) without duplicating the button.
           *
           * onContextMenu preventDefault stops the browser's long-press
           * context menu from hijacking the hold gesture on iOS / Android.
           */}
          <Button
            variant="default"
            size="icon"
            // ── Desktop ──────────────────────────────────────────────
            onMouseDown={(e) => {
              e.preventDefault(); // prevents focus steal on desktop
              if (!disabled) onStartRecording();
            }}
            onMouseUp={() => {
              if (!disabled) onStopRecording();
            }}
            onMouseLeave={() => {
              if (isRecording) onStopRecording();
            }}
            // ── Mobile ───────────────────────────────────────────────
            onTouchStart={(e) => {
              e.preventDefault(); // prevents ghost click + scrolling during hold
              if (!disabled) onStartRecording();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              if (!disabled) onStopRecording();
            }}
            onTouchCancel={() => {
              if (isRecording) onStopRecording();
            }}
            // Suppress long-press context menu on Android / iOS
            onContextMenu={(e) => e.preventDefault()}
            className={cn(
              "h-11 w-11 shrink-0 rounded-full transition-[background-color,box-shadow,transform] duration-300 shadow-md",
              "touch-none select-none", // touch-none prevents scroll interference
              isRecording
                ? "bg-red-500 text-white scale-[1.15] shadow-[0_8px_20px_rgba(239,68,68,0.35)] -translate-y-1"
                : "bg-forge-teal text-white hover:bg-forge-teal/90",
            )}
            aria-label={
              isRecording ? "Release to send" : "Hold to record voice message"
            }
            aria-pressed={isRecording}
            disabled={disabled}
          >
            <Mic
              size={20}
              className={cn(isRecording && "animate-pulse")}
              strokeWidth={isRecording ? 2.5 : 2}
            />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  ),
);
