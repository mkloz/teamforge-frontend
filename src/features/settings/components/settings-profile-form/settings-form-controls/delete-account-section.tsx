import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { User } from "@/shared/schemas";

interface DeleteAccountSectionProps {
  currentUser: User | undefined;
  isOnline: boolean;
  isDeleting: boolean;
  error: string | null;
  onDelete: () => Promise<void>;
}

export function DeleteAccountSection({
  currentUser,
  isOnline,
  isDeleting,
  error,
  onDelete,
}: DeleteAccountSectionProps) {
  const [confirmation, setConfirmation] = useState("");
  const canDelete = isOnline && confirmation === "DELETE";

  return (
    <section className="border-destructive/30 border-t pt-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 max-w-2xl flex-1">
          <p className="font-semibold text-destructive text-xs uppercase tracking-widest">
            Permanent action
          </p>
          <h3 className="mt-2 font-semibold text-ink text-lg">
            Delete account
          </h3>
          <p className="mt-2 text-slate-muted text-sm leading-relaxed">
            This signs you out, disables automatic group forming, removes active
            sessions, and anonymizes your sign-in identifiers. Existing group
            history may remain where other members need context.
          </p>
          {error ? (
            <p className="mt-3 font-medium text-destructive text-sm">{error}</p>
          ) : null}
        </div>

        <ActionDialog
          cancelLabel="Keep account"
          confirmLabel={isDeleting ? "Deleting..." : "Delete account"}
          description={`This cannot be undone from the app. Type DELETE to confirm deletion for ${
            currentUser?.email ?? "this account"
          }.`}
          details={[
            "Your active sessions will be removed.",
            "Automatic group forming will stop for this account.",
            "Existing group history may remain where other members need context.",
          ]}
          disabled={!canDelete || isDeleting}
          loading={isDeleting}
          onConfirm={onDelete}
          onOpenChange={(open) => {
            if (!open) {
              setConfirmation("");
            }
          }}
          title="Delete your TeamForge account?"
          tone="danger"
          trigger={
            <Button
              type="button"
              variant="destructive"
              className="shrink-0"
              disabled={!isOnline || isDeleting}
            >
              <Trash2 size={14} />
              Delete account
            </Button>
          }
        >
          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={!isOnline || isDeleting}
            placeholder="DELETE"
            aria-label="Type DELETE to confirm account deletion"
          />
        </ActionDialog>
      </div>
    </section>
  );
}
