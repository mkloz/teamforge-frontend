import { MessageSquare } from "lucide-react";

export function ActivityEmptyState() {
  return (
    <section className="hidden flex-1 items-center justify-center bg-canvas/30 backdrop-blur-sm md:flex">
      <div className="max-w-sm px-6 text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-xl border border-forge-teal/15 bg-forge-teal/8 shadow-sm">
          <MessageSquare className="size-7 text-forge-teal" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold text-ink">
          Pick a conversation to begin.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-muted">
          Select any group or direct message from the list to start chatting and
          planning activities together.
        </p>
      </div>
    </section>
  );
}
