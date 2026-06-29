import { useState } from "react";

import type { ActivitySendMessageInput } from "@/features/activity/lib/activity-contract";

import {
  MessageInputAction,
  MessageInputContextPanel,
  MessageInputDropzonePortal,
  MessageInputPill,
} from "./message-input-sections";
import { getMessageInputViewState } from "./message-input-view-state";
import { useMessageComposer } from "./use-message-composer";

interface UnifiedMessageInputProps {
  chatId?: string | null;
  errorMessage?: string | null;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
  onClearError?: () => void;
  onCreateProposal?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function UnifiedMessageInput({
  chatId = null,
  errorMessage = null,
  onSend,
  onClearError,
  onCreateProposal,
  disabled = false,
  placeholder = "Type a message...",
}: UnifiedMessageInputProps) {
  const [inputRoot, setInputRoot] = useState<HTMLDivElement | null>(null);
  const dropzoneRoot =
    inputRoot?.closest<HTMLElement>("[data-chat-dropzone-root]") ?? null;
  const composer = useMessageComposer({
    chatId,
    disabled,
    dropzoneRoot,
    errorMessage,
    onClearError,
    onSend,
  });

  const viewState = getMessageInputViewState({
    composer,
    errorMessage,
    placeholder,
  });

  return (
    <div
      ref={setInputRoot}
      className="isolate z-30 min-h-16 shrink-0 overflow-visible border-border/60 border-t bg-canvas/90 px-2.5 pt-2 pb-safe-bottom backdrop-blur-xl sm:px-3"
    >
      <MessageInputDropzonePortal
        composer={composer}
        dropzoneRoot={dropzoneRoot}
      />

      <div className="mx-auto flex w-full items-center gap-2 sm:gap-2.5">
        <div className="relative min-w-0 flex-1">
          <MessageInputContextPanel
            composer={composer}
            errorMessage={errorMessage}
            viewState={viewState}
            onClearError={onClearError}
          />

          <MessageInputPill
            composer={composer}
            viewState={viewState}
            onCreateProposal={onCreateProposal}
          />
        </div>

        <MessageInputAction composer={composer} viewState={viewState} />
      </div>
    </div>
  );
}
