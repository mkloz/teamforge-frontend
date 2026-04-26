import { memo } from "react";
import { Mic, Image as ImageIcon, FileText, ClipboardList } from "lucide-react";
import type { MessageType } from "@/shared/schemas/enums";

export const SubtitleIcon = memo(({ type }: { type?: MessageType }) => {
  if (!type) return null;
  const icons = {
    VOICE: <Mic size={14} className="shrink-0 text-forge-teal" />,
    IMAGE: <ImageIcon size={14} className="shrink-0 text-forge-teal" />,
    FILE: <FileText size={14} className="shrink-0 text-forge-teal" />,
    PLAN_UPDATE: (
      <ClipboardList size={14} className="shrink-0 text-spark-amber" />
    ),
  };
  return (icons as Record<string, React.ReactElement>)[type] || null;
});
