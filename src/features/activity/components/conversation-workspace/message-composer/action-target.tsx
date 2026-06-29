import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { Mic, Send, Trash2 } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface ActionTargetProps {
  hasContent: boolean;
  isRecording: boolean;
  onSend: () => void;
  onCancelRecording: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled: boolean;
}

export function ActionTarget({
  hasContent,
  isRecording,
  onSend,
  onCancelRecording,
  onStartRecording,
  onStopRecording,
  disabled,
}: ActionTargetProps) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="popLayout">
        {hasContent ? (
          <SendAction key="send" disabled={disabled} onSend={onSend} />
        ) : (
          <RecordingAction
            key="mic"
            disabled={disabled}
            isRecording={isRecording}
            onCancelRecording={onCancelRecording}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
          />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

function SendAction({
  disabled,
  onSend,
}: Pick<ActionTargetProps, "disabled" | "onSend">) {
  return (
    <m.div
      key="send"
      initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 15 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onSend}
            disabled={disabled}
            size="icon"
            variant="primary"
            className="flex-none rounded-full"
            aria-label="Send message"
          >
            <Send className="ml-0.5 size-4" strokeWidth={2.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Send message</TooltipContent>
      </Tooltip>
    </m.div>
  );
}

function RecordingAction({
  disabled,
  isRecording,
  onCancelRecording,
  onStartRecording,
  onStopRecording,
}: Omit<ActionTargetProps, "hasContent" | "onSend">) {
  return (
    <m.div
      key="mic"
      initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: -15 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex items-center gap-2"
    >
      <CancelRecordingAction
        isRecording={isRecording}
        onCancelRecording={onCancelRecording}
      />
      <RecordButton
        disabled={disabled}
        isRecording={isRecording}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
      />
    </m.div>
  );
}

function CancelRecordingAction({
  isRecording,
  onCancelRecording,
}: Pick<ActionTargetProps, "isRecording" | "onCancelRecording">) {
  return (
    <AnimatePresence>
      {isRecording && (
        <m.div
          initial={{ opacity: 0, scale: 0.5, width: 0 }}
          animate={{ opacity: 1, scale: 1, width: "auto" }}
          exit={{ opacity: 0, scale: 0.5, width: 0 }}
          className="overflow-hidden"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={onCancelRecording}
                className="rounded-full"
                aria-label="Cancel recording"
              >
                <Trash2 className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel recording</TooltipContent>
          </Tooltip>
        </m.div>
      )}
    </AnimatePresence>
  );
}

function RecordButton({
  disabled,
  isRecording,
  onStartRecording,
  onStopRecording,
}: Pick<
  ActionTargetProps,
  "disabled" | "isRecording" | "onStartRecording" | "onStopRecording"
>) {
  function handleRecordingKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isRecordingActivationKey(event)) {
      return;
    }

    event.preventDefault();
    if (!disabled && !isRecording) {
      onStartRecording();
    }
  }

  function handleRecordingKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isRecordingActivationKey(event)) {
      return;
    }

    event.preventDefault();
    if (!disabled) {
      onStopRecording();
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isRecording ? "destructive" : "primary"}
          size="icon"
          onMouseDown={(e) => {
            e.preventDefault();
            if (!disabled) onStartRecording();
          }}
          onMouseUp={() => {
            if (!disabled) onStopRecording();
          }}
          onMouseLeave={() => {
            if (isRecording) onStopRecording();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!disabled) onStartRecording();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            if (!disabled) onStopRecording();
          }}
          onTouchCancel={() => {
            if (isRecording) onStopRecording();
          }}
          onKeyDown={handleRecordingKeyDown}
          onKeyUp={handleRecordingKeyUp}
          onContextMenu={(e) => e.preventDefault()}
          className={cn(
            "rounded-full transition-all duration-300",
            "touch-none select-none",
            isRecording && "scale-110 after:hidden",
          )}
          aria-label={getRecordingAriaLabel(isRecording)}
          aria-pressed={isRecording}
          disabled={disabled}
        >
          <Mic
            className={cn(
              "size-5",
              isRecording && "animate-pulse motion-reduce:animate-none",
            )}
            strokeWidth={isRecording ? 2.5 : 2}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{getRecordingTooltipLabel(isRecording)}</TooltipContent>
    </Tooltip>
  );
}

function isRecordingActivationKey(event: KeyboardEvent<HTMLButtonElement>) {
  return event.key === " " || event.key === "Enter";
}

function getRecordingAriaLabel(isRecording: boolean) {
  return isRecording ? "Release to send" : "Hold to record voice message";
}

function getRecordingTooltipLabel(isRecording: boolean) {
  return isRecording ? "Release to send" : "Hold to record";
}
