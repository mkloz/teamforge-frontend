import { MessageSquare } from "lucide-react";
import { memo } from "react";

interface EmptyStateProps {
  label: string;
}

export const EmptyState = memo(function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center animate-in fade-in slide-in-from-bottom-2">
      <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center opacity-40 shadow-sm border border-border/10">
        <MessageSquare size={24} className="text-forge-teal" />
      </div>
      <p className="text-sm font-medium text-slate-muted/90">{label}</p>
    </div>
  );
});
