import { memo } from "react";
import { Mic, Image as ImageIcon, FileText, ClipboardList } from "lucide-react";
import type { MessageType } from "@/shared/schemas/enums";

export const SubtitleIcon = memo(
  ({
    type,
    isCompact = false,
  }: {
    type?: MessageType;
    isCompact?: boolean;
  }) => {
    if (!type) return null;
    const size = isCompact ? 12 : 14;

    const icons: Partial<Record<MessageType, React.ReactElement>> = {
      VOICE: <Mic size={size} className="shrink-0 text-forge-teal" />,
      IMAGE: <ImageIcon size={size} className="shrink-0 text-forge-teal" />,
      FILE: <FileText size={size} className="shrink-0 text-forge-teal" />,
      PLAN_UPDATE: (
        <ClipboardList size={size} className="shrink-0 text-spark-amber" />
      ),
    };

    return icons[type] || null;
  },
);
