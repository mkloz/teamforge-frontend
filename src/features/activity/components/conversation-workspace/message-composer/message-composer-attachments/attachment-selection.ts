import type { ActivityOutgoingAttachment } from "@/features/activity/lib/activity-contract";
import { CHAT_MAX_ATTACHMENTS } from "@/shared/api/api-constraints";

import {
  dedupeAttachments,
  getAttachmentFileKey,
  getChatAttachmentSizeLabel,
  isChatAttachmentWithinSizeLimit,
  isImageAttachmentCandidate,
} from "../message-composer-utils";
import type {
  MessageComposerAttachmentSelectionKind,
  MessageComposerAttachmentState,
} from "./types";

interface AttachableFilesResult {
  attachableFiles: File[];
  skippedNonImages: number;
  skippedOversized: number;
}

interface AttachmentLimitNoticeState {
  allIncomingAlreadyAttached: boolean;
  isAtLimit: boolean;
  newlyAddedCount: number;
  skippedCount: number;
}

interface AttachmentLimitNoticeRule {
  getText: (state: AttachmentLimitNoticeState) => string;
  shouldShow: (state: AttachmentLimitNoticeState) => boolean;
}

export const initialAttachmentState: MessageComposerAttachmentState = {
  attachmentNotice: null,
  pendingAttachments: [],
};

const ATTACHMENT_LIMIT_NOTICE_RULES = [
  {
    shouldShow: ({ isAtLimit }) => isAtLimit,
    getText: getAttachmentLimitReachedNotice,
  },
  {
    shouldShow: ({ skippedCount }) => skippedCount > 0,
    getText: getAttachmentLimitSkippedNotice,
  },
  {
    shouldShow: ({ allIncomingAlreadyAttached }) => allIncomingAlreadyAttached,
    getText: getAlreadyAttachedNotice,
  },
] as const satisfies AttachmentLimitNoticeRule[];

function pluralizeFile(count: number) {
  return count === 1 ? "file" : "files";
}

function getSkippedAttachmentNotice({
  skippedNonImages,
  skippedOversized,
}: {
  skippedNonImages: number;
  skippedOversized: number;
}) {
  const notices: string[] = [];

  if (skippedOversized > 0) {
    notices.push(
      `Skipped ${skippedOversized} ${pluralizeFile(skippedOversized)} over ${getChatAttachmentSizeLabel()}.`,
    );
  }

  if (skippedNonImages > 0) {
    notices.push(
      `Skipped ${skippedNonImages} non-image ${pluralizeFile(skippedNonImages)}. Use Documents for non-photo uploads.`,
    );
  }

  return notices.length > 0 ? notices.join(" ") : null;
}

export function getAttachableFiles(
  files: File[],
  selectionKind: MessageComposerAttachmentSelectionKind,
) {
  const result = getAttachableFilesResult(files, selectionKind);

  return {
    attachableFiles: result.attachableFiles,
    skippedNotice: getSkippedAttachmentNotice({
      skippedNonImages: result.skippedNonImages,
      skippedOversized: result.skippedOversized,
    }),
  };
}

function getAttachableFilesResult(
  files: File[],
  selectionKind: MessageComposerAttachmentSelectionKind,
) {
  const result: AttachableFilesResult = {
    attachableFiles: [],
    skippedNonImages: 0,
    skippedOversized: 0,
  };

  for (const file of files) {
    addAttachableFileResult(result, file, selectionKind);
  }

  return result;
}

function addAttachableFileResult(
  result: AttachableFilesResult,
  file: File,
  selectionKind: MessageComposerAttachmentSelectionKind,
) {
  const disposition = getAttachmentFileDisposition(file, selectionKind);

  if (disposition === "attach") {
    result.attachableFiles.push(file);
    return;
  }

  if (disposition === "oversized") {
    result.skippedOversized += 1;
    return;
  }

  result.skippedNonImages += 1;
}

function getAttachmentFileDisposition(
  file: File,
  selectionKind: MessageComposerAttachmentSelectionKind,
) {
  if (!isChatAttachmentWithinSizeLimit(file)) {
    return "oversized";
  }

  if (selectionKind === "image" && !isImageAttachmentCandidate(file)) {
    return "non-image";
  }

  return "attach";
}

function combineAttachmentNotices(...notices: Array<string | null>) {
  const combined = notices.filter((notice) => notice !== null);

  return combined.length > 0 ? combined.join(" ") : null;
}

export function getPendingAttachmentsWithNotice({
  attachableFiles,
  currentAttachments,
  skippedNotice,
}: {
  attachableFiles: File[];
  currentAttachments: ActivityOutgoingAttachment[];
  skippedNotice: string | null;
}): MessageComposerAttachmentState {
  const pendingAttachments = dedupeAttachments([
    ...currentAttachments,
    ...attachableFiles.map((file) => ({
      file,
    })),
  ]);
  const limitNotice = getAttachmentLimitNotice({
    currentAttachments,
    incomingFiles: attachableFiles,
    nextAttachments: pendingAttachments,
  });

  return {
    attachmentNotice: combineAttachmentNotices(skippedNotice, limitNotice),
    pendingAttachments,
  };
}

function getAttachmentLimitNotice({
  currentAttachments,
  incomingFiles,
  nextAttachments,
}: {
  currentAttachments: ActivityOutgoingAttachment[];
  incomingFiles: File[];
  nextAttachments: ActivityOutgoingAttachment[];
}) {
  const noticeState = getAttachmentLimitNoticeState({
    currentAttachments,
    incomingFiles,
    nextAttachments,
  });

  return getAttachmentLimitNoticeText(noticeState);
}

function getAttachmentLimitNoticeState({
  currentAttachments,
  incomingFiles,
  nextAttachments,
}: {
  currentAttachments: ActivityOutgoingAttachment[];
  incomingFiles: File[];
  nextAttachments: ActivityOutgoingAttachment[];
}): AttachmentLimitNoticeState {
  const currentKeys = new Set(
    currentAttachments.map(({ file }) => getAttachmentFileKey(file)),
  );
  const incomingUniqueKeys = new Set(
    incomingFiles.map((file) => getAttachmentFileKey(file)),
  );
  const requestedNewCount = [...incomingUniqueKeys].filter(
    (key) => !currentKeys.has(key),
  ).length;
  const newlyAddedCount = nextAttachments.length - currentAttachments.length;
  const skippedCount = requestedNewCount - newlyAddedCount;

  return {
    allIncomingAlreadyAttached:
      newlyAddedCount === 0 &&
      [...incomingUniqueKeys].every((key) => currentKeys.has(key)),
    isAtLimit: currentAttachments.length >= CHAT_MAX_ATTACHMENTS,
    newlyAddedCount,
    skippedCount,
  };
}

function getAttachmentLimitNoticeText({
  allIncomingAlreadyAttached,
  isAtLimit,
  newlyAddedCount,
  skippedCount,
}: AttachmentLimitNoticeState) {
  const state = {
    allIncomingAlreadyAttached,
    isAtLimit,
    newlyAddedCount,
    skippedCount,
  };

  return (
    ATTACHMENT_LIMIT_NOTICE_RULES.find((rule) =>
      rule.shouldShow(state),
    )?.getText(state) ?? null
  );
}

function getAttachmentLimitReachedNotice() {
  return `Messages support up to ${CHAT_MAX_ATTACHMENTS} attachments. Remove one before adding more.`;
}

function getAttachmentLimitSkippedNotice({
  newlyAddedCount,
}: AttachmentLimitNoticeState) {
  return `Attached ${Math.max(newlyAddedCount, 0)} file${newlyAddedCount === 1 ? "" : "s"}. Messages support up to ${CHAT_MAX_ATTACHMENTS} attachments.`;
}

function getAlreadyAttachedNotice() {
  return "Those files are already attached.";
}
