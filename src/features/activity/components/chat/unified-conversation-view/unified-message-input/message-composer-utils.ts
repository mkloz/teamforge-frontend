import type { ActivityOutgoingAttachment } from "@/features/activity/lib/activity-contract";

export const MAX_TEXTAREA_HEIGHT = 120;

export function getVoiceExtension(mimeType: string) {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
}

export function dedupeAttachments(
  nextAttachments: ActivityOutgoingAttachment[],
) {
  const seen = new Set<string>();

  return nextAttachments.filter(({ file }) => {
    const key = [file.name, file.size, file.lastModified].join(":");
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
