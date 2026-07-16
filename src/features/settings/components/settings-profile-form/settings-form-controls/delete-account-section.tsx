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

const DELETE_ACCOUNT_CONFIRMATION = "DELETE";
const DELETE_ACCOUNT_DETAILS = [
  "Your active sessions will be removed.",
  "Proposal availability will close for this account.",
  "Existing group history may remain where other members need context.",
];

function getDeleteAccountDescription(email?: string) {
  return `This cannot be undone from the app. Type DELETE to confirm deletion for ${
    email ?? "this account"
  }.`;
}

function getDeleteAccountConfirmLabel(isDeleting: boolean) {
  return isDeleting ? "Deleting..." : "Delete account";
}

function getCanDelete(isOnline: boolean, confirmation: string) {
  return isOnline && confirmation === DELETE_ACCOUNT_CONFIRMATION;
}

function DeleteAccountError({ error }: { error: string | null }) {
  return error ? (
    <p className="mt-3 font-medium text-destructive text-sm">{error}</p>
  ) : null;
}

function DeleteAccountTrigger({
  isDeleting,
  isOnline,
}: {
  isDeleting: boolean;
  isOnline: boolean;
}) {
  return (
    <Button
      type="button"
      variant="destructive"
      className="shrink-0"
      disabled={!isOnline || isDeleting}
    >
      <Trash2 size={14} />
      Delete account
    </Button>
  );
}

function DeleteAccountConfirmationInput({
  confirmation,
  isDeleting,
  isOnline,
  onConfirmationChange,
}: {
  confirmation: string;
  isDeleting: boolean;
  isOnline: boolean;
  onConfirmationChange: (value: string) => void;
}) {
  return (
    <Input
      value={confirmation}
      onChange={(event) => onConfirmationChange(event.target.value)}
      disabled={!isOnline || isDeleting}
      placeholder={DELETE_ACCOUNT_CONFIRMATION}
      aria-label="Type DELETE to confirm account deletion"
    />
  );
}

export function DeleteAccountSection({
  currentUser,
  isOnline,
  isDeleting,
  error,
  onDelete,
}: DeleteAccountSectionProps) {
  const [confirmation, setConfirmation] = useState("");
  const canDelete = getCanDelete(isOnline, confirmation);

  function handleDialogOpenChange(open: boolean) {
    if (!open) {
      setConfirmation("");
    }
  }

  return (
    <section className="border-destructive/30 border-t pt-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 max-w-2xl flex-1">
          <p className="font-semibold text-destructive text-xs">
            Permanent action
          </p>
          <h3 className="mt-2 font-semibold text-ink text-lg">
            Delete account
          </h3>
          <p className="mt-2 text-slate-muted text-sm leading-relaxed">
            This signs you out, closes your proposal availability, removes
            active sessions, and anonymizes your sign-in identifiers. Existing
            group history may remain where other members need context.
          </p>
          <DeleteAccountError error={error} />
        </div>

        <ActionDialog
          cancelLabel="Keep account"
          confirmLabel={getDeleteAccountConfirmLabel(isDeleting)}
          description={getDeleteAccountDescription(currentUser?.email)}
          details={DELETE_ACCOUNT_DETAILS}
          disabled={!canDelete || isDeleting}
          loading={isDeleting}
          onConfirm={onDelete}
          onOpenChange={handleDialogOpenChange}
          title="Delete your TeamForge account?"
          tone="danger"
          trigger={
            <DeleteAccountTrigger isDeleting={isDeleting} isOnline={isOnline} />
          }
        >
          <DeleteAccountConfirmationInput
            confirmation={confirmation}
            isDeleting={isDeleting}
            isOnline={isOnline}
            onConfirmationChange={setConfirmation}
          />
        </ActionDialog>
      </div>
    </section>
  );
}
