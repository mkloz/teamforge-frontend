import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { User } from "@/shared/schemas";
import { Trash2 } from "lucide-react";

interface DeleteAccountSectionProps {
  currentUser: User | undefined;
  isDeleting: boolean;
  error: string | null;
  onDelete: () => Promise<void>;
}

export function DeleteAccountSection({
  currentUser,
  isDeleting,
  error,
  onDelete,
}: DeleteAccountSectionProps) {
  const [confirmation, setConfirmation] = useState("");
  const canDelete = confirmation === "DELETE";

  return (
    <section className="border-t border-destructive/30 pt-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-destructive uppercase">
            Permanent action
          </p>
          <h3 className="mt-2 text-lg font-semibold text-ink">
            Delete account
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-muted">
            This signs you out, disables automatic group forming, removes active
            sessions, and anonymizes your sign-in identifiers. Existing group
            history may remain where other members need context.
          </p>
          {error ? (
            <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
          ) : null}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive">
              <Trash2 size={14} />
              Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete your TeamForge account?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone from the app. Type DELETE to confirm
                deletion for {currentUser?.email ?? "this account"}.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="DELETE"
              aria-label="Type DELETE to confirm account deletion"
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!canDelete || isDeleting}
                onClick={(event) => {
                  event.preventDefault();
                  if (!canDelete || isDeleting) {
                    return;
                  }
                  void onDelete();
                }}
              >
                {isDeleting ? "Deleting..." : "Delete account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
