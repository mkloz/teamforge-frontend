import { memo } from "react";
import {
  Mic,
  Image as ImageIcon,
  FileText,
  MapPin,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import type { UnifiedConversation } from "../../types/unified-conversation.types";

export const SubtitleIcon = memo(
  ({ type }: { type: UnifiedConversation["subtitleIcon"] }) => {
    if (!type) return null;
    const icons = {
      voice: <Mic size={14} className="shrink-0 text-forge-teal" />,
      image: <ImageIcon size={14} className="shrink-0 text-forge-teal" />,
      file: <FileText size={14} className="shrink-0 text-forge-teal" />,
      location: <MapPin size={14} className="shrink-0 text-forge-teal" />,
      proposal: (
        <ClipboardList size={14} className="shrink-0 text-spark-amber" />
      ),
      poll: <BarChart3 size={14} className="shrink-0 text-spark-amber" />,
    };
    return (icons as Record<string, React.ReactElement>)[type] || null;
  },
);
