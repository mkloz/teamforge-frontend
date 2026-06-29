import type { LucideIcon } from "lucide-react";

import { AttentionQueueMeta } from "./attention-queue-meta";

interface AttentionQueueMetaItem {
  icon: LucideIcon;
  label: string;
}

interface AttentionQueueMetaListProps {
  items: AttentionQueueMetaItem[];
}

export function AttentionQueueMetaList({ items }: AttentionQueueMetaListProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
      {items.map((item) => (
        <AttentionQueueMeta key={item.label} icon={item.icon}>
          {item.label}
        </AttentionQueueMeta>
      ))}
    </div>
  );
}
