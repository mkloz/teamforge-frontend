import { ClipboardList, FileText, Image as ImageIcon, Mic } from "lucide-react";
import type { ReactElement } from "react";
import type { MessageType } from "@/shared/schemas/enums";

export function SubtitleIcon({
  type,
  isCompact = false,
}: {
  type?: MessageType;
  isCompact?: boolean;
}) {
  if (!type) return null;
  const size = isCompact ? 12 : 14;

  const icons: Partial<Record<MessageType, ReactElement>> = {
    VOICE: <Mic size={size} className="shrink-0 text-foreground" />,
    IMAGE: <ImageIcon size={size} className="shrink-0 text-foreground" />,
    FILE: <FileText size={size} className="shrink-0 text-foreground" />,
    PLAN_UPDATE: (
      <ClipboardList size={size} className="shrink-0 text-spark-amber" />
    ),
  };

  return icons[type] || null;
}
