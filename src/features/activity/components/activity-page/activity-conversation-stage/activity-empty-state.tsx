import { MessageSquare } from "lucide-react";

export function ActivityEmptyState() {
  return (
    <section className="flex-1 hidden md:flex items-center justify-center bg-canvas/30 backdrop-blur-sm">
      <div className="text-center max-w-sm px-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-forge-teal/8 flex items-center justify-center mb-6 shadow-sm border border-forge-teal/15">
          <MessageSquare
            size={28}
            className="text-forge-teal"
            strokeWidth={1.5}
          />
        </div>
        <h2 className="text-lg font-bold text-ink">
          Pick a conversation to begin.
        </h2>
        <p className="text-sm mt-2 text-slate-muted leading-relaxed">
          Select any group or direct message from the list to start chatting and
          planning activities together.
        </p>
      </div>
    </section>
  );
}
