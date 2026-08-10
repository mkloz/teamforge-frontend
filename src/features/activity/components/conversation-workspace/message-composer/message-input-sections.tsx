import { Paperclip, X } from "lucide-react";
import { createPortal } from "react-dom";

import { ErrorMessageSendFailedVisual } from "@/features/activity/assets/error-message-send-failed";
import { getActivityPopupPanelClass } from "@/features/activity/components/activity-popup-styles";
import { Button } from "@/shared/components/ui/button";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";

import { ActionTarget } from "./action-target";
import { AttachmentPreviewPanel } from "./attachment-preview-panel";
import { ChatDropzoneOverlay } from "./chat-dropzone-overlay";
import { EditingMessageBanner } from "./editing-message-banner";
import { InputRow } from "./input-row";
import type {
  MessageComposer,
  MessageInputViewState,
} from "./message-input-view-state";
import { RecordingOverlay } from "./recording-overlay";
import { ReplyPreview } from "./reply-preview";

interface MessageInputDropzonePortalProps {
  composer: MessageComposer;
  dropzoneRoot: HTMLElement | null;
}

interface MessageInputContextPanelProps {
  composer: MessageComposer;
  errorMessage: string | null;
  onClearError?: () => void;
  viewState: MessageInputViewState;
}

interface MessageInputPillProps {
  allowAttachments: boolean;
  allowGif: boolean;
  composer: MessageComposer;
  onCreateProposal?: () => void;
  viewState: MessageInputViewState;
}

interface MessageInputActionProps {
  allowVoiceNotes: boolean;
  composer: MessageComposer;
  viewState: MessageInputViewState;
}

const EMPTY_ATTACHMENT_HANDLER = () => {};

export function MessageInputDropzonePortal({
  composer,
  dropzoneRoot,
}: MessageInputDropzonePortalProps) {
  return dropzoneRoot && composer.isDraggingFiles
    ? createPortal(<ChatDropzoneOverlay />, dropzoneRoot)
    : null;
}

export function MessageInputContextPanel({
  composer,
  errorMessage,
  onClearError,
  viewState,
}: MessageInputContextPanelProps) {
  if (!viewState.hasContextPanel) {
    return null;
  }

  return (
    <div
      className={getActivityPopupPanelClass(
        "absolute right-0 bottom-full left-0 z-20 mb-2 max-h-96 overflow-y-auto rounded-lg bg-card/95",
      )}
    >
      <ReplyPreview
        replyingTo={composer.isEditing ? null : composer.replyingTo}
        onClear={composer.clearReply}
      />

      <EditingContextBanner composer={composer} />

      <AttachmentPreviewPanel
        disabled={composer.areNetworkActionsDisabled}
        files={viewState.attachmentFiles}
        isEditing={composer.isEditing}
        onAppendAttachments={composer.appendAttachments}
        onRemoveAttachment={composer.removeAttachment}
      />

      <AttachmentNotice message={composer.attachmentNotice} />

      <ComposerOfflineNotice isOnline={composer.isOnline} />

      <RecordingErrorNotice message={viewState.recordingErrorMessage} />

      <SendErrorNotice message={errorMessage} onClearError={onClearError} />
    </div>
  );
}

function EditingContextBanner({ composer }: { composer: MessageComposer }) {
  return composer.isEditing && composer.editingMessage ? (
    <EditingMessageBanner onCancel={composer.cancelEditing} />
  ) : null;
}

function AttachmentNotice({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <output className="flex items-center gap-2 px-3 py-2.5 text-slate-muted">
      <Paperclip className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 font-medium text-xs">{message}</span>
    </output>
  );
}

function ComposerOfflineNotice({ isOnline }: { isOnline: boolean }) {
  if (isOnline) {
    return null;
  }

  return (
    <OfflineNotice
      size="xs"
      iconClassName="mt-0"
      className="items-center border-0 bg-transparent px-3 py-2.5 text-accent"
      contentClassName="font-medium"
    >
      <p>
        You are offline. Reconnect before sending messages or adding
        attachments.
      </p>
    </OfflineNotice>
  );
}

function RecordingErrorNotice({ message }: { message: string | null }) {
  return message ? (
    <p className="px-4 py-2 font-medium text-destructive/80 text-xs">
      {message}
    </p>
  ) : null;
}

function SendErrorNotice({
  message,
  onClearError,
}: {
  message: string | null;
  onClearError?: () => void;
}) {
  if (!message) {
    return null;
  }

  return (
    <div role="alert" className="flex items-center gap-2 px-3 py-2.5">
      <ErrorMessageSendFailedVisual className="h-5 w-auto shrink-0 text-foreground" />
      <p className="min-w-0 flex-1 font-medium text-destructive/80 text-xs">
        {message}
      </p>
      {onClearError ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Dismiss send error"
          className="size-7 shrink-0 rounded-full text-slate-muted focus-visible:ring-destructive/25 hover:enabled:bg-destructive-soft hover:enabled:text-destructive"
          onClick={onClearError}
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

export function MessageInputPill({
  allowAttachments,
  allowGif,
  composer,
  onCreateProposal,
  viewState,
}: MessageInputPillProps) {
  const attachmentControls = getMessageInputAttachmentControls(
    composer,
    onCreateProposal,
    allowAttachments,
    allowGif,
  );

  return (
    <div className={viewState.inputPillClasses}>
      {composer.isRecording ? (
        <RecordingOverlay timeLabel={viewState.recordingTimeLabel} />
      ) : (
        <InputRow
          value={composer.value}
          onChange={composer.handleValueChange}
          onKeyDown={composer.handleKeyDown}
          onFocus={() => composer.setIsFocused(true)}
          onBlur={() => composer.setIsFocused(false)}
          textareaRef={composer.textareaRef}
          onInsertEmoji={composer.insertEmoji}
          onSelectGif={composer.sendGif}
          placeholder={viewState.inputPlaceholder}
          disabled={composer.isDisabled}
          onSelectImages={attachmentControls.onSelectImages}
          onSelectFiles={attachmentControls.onSelectFiles}
          controlsDisabled={composer.areNetworkActionsDisabled}
          canAttach={attachmentControls.canAttach}
          canSendGif={attachmentControls.canSendGif}
          allowGif={allowGif}
          onCreateProposal={attachmentControls.onCreateProposal}
        />
      )}
    </div>
  );
}

function getMessageInputAttachmentControls(
  composer: MessageComposer,
  onCreateProposal?: () => void,
  allowAttachments = true,
  allowGif = true,
) {
  const isComposingNewMessage = !composer.isEditing;

  return {
    canAttach: isComposingNewMessage && allowAttachments,
    canSendGif: isComposingNewMessage && allowGif && composer.isOnline,
    onCreateProposal: isComposingNewMessage ? onCreateProposal : undefined,
    onSelectFiles: isComposingNewMessage
      ? composer.appendAttachments
      : EMPTY_ATTACHMENT_HANDLER,
    onSelectImages: isComposingNewMessage
      ? composer.appendImageAttachments
      : EMPTY_ATTACHMENT_HANDLER,
  };
}

export function MessageInputAction({
  allowVoiceNotes,
  composer,
  viewState,
}: MessageInputActionProps) {
  if (!allowVoiceNotes && !composer.hasDraft) {
    return null;
  }
  function startRecordingIfEnabled() {
    if (!viewState.isActionTargetDisabled) {
      void composer.startRecording();
    }
  }

  function stopRecordingIfAllowed() {
    if (composer.isRecording || !viewState.isActionTargetDisabled) {
      void composer.handleStopRecording();
    }
  }

  return (
    <div className="flex h-11 shrink-0 items-center">
      <ActionTarget
        hasContent={composer.hasDraft}
        isRecording={composer.isRecording}
        onSend={() => {
          composer.handleSubmit();
        }}
        onCancelRecording={composer.cancelRecording}
        onStartRecording={startRecordingIfEnabled}
        onStopRecording={stopRecordingIfAllowed}
        disabled={viewState.isActionTargetDisabled}
      />
    </div>
  );
}
