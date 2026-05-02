interface InviteNoteProps {
  forgeMode: "AUTO" | "MANUAL";
  inviteeCount: number;
}

export function InviteNote({ forgeMode, inviteeCount }: InviteNoteProps) {
  return (
    <div className="flex gap-3 p-4 rounded-2xl border border-border/40 bg-card">
      <div className="rounded-full bg-primary/20 w-2 h-2 mt-1.5 shrink-0" />
      <div className="space-y-1">
        <p className="text-xs font-semibold text-primary/80">
          Sending invitations
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {forgeMode === "MANUAL"
            ? `Finishing will send ${inviteeCount} invitation${
                inviteeCount !== 1 ? "s" : ""
              } and leave the group ready for replies.`
            : "The group is formed already. Finishing keeps everything saved and takes you to the group hub."}
        </p>
      </div>
    </div>
  );
}
