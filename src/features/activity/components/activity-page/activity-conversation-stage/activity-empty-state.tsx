import { ActivityNoConversationSelectedVisual } from "@/assets/empty-state/activity-no-conversation-selected";

export function ActivityEmptyState() {
  return (
    <section className="hidden flex-1 items-center justify-center bg-canvas/30 backdrop-blur-sm md:flex">
      <div className="max-w-sm px-6 text-center">
        <ActivityNoConversationSelectedVisual className="mx-auto mb-6 h-36 w-auto text-foreground" />
        <h2 className="font-bold text-ink text-lg">
          Pick a conversation to begin.
        </h2>
        <p className="mt-2 text-slate-muted text-sm leading-relaxed">
          Select any group or direct message from the list to start chatting and
          planning activities together.
        </p>
      </div>
    </section>
  );
}
