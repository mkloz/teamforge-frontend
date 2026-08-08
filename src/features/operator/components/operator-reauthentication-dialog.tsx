import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

export interface OperatorReauthenticationDialogProps {
  error: string | null;
  loading: boolean;
  onConfirm: (password: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function OperatorReauthenticationDialog({
  error,
  loading,
  onConfirm,
  onOpenChange,
  open,
}: OperatorReauthenticationDialogProps) {
  const passwordInputId = useId();
  const passwordDescriptionId = `${passwordInputId}-description`;
  const passwordErrorId = `${passwordInputId}-error`;
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (open) return;
    setPassword("");
    setPasswordVisible(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5">
        <DialogHeader className="pr-10 text-left">
          <span className="mb-1 inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-foreground">
            <KeyRound className="size-4.5" aria-hidden="true" />
          </span>
          <DialogTitle>Confirm it’s you</DialogTitle>
          <DialogDescription>
            This action has not run yet. Enter your TeamForge password, then
            retry it without losing your place or unfinished work.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (password.trim() && !loading) onConfirm(password);
          }}
        >
          <Field className="gap-2" data-invalid={Boolean(error)}>
            <FieldLabel
              htmlFor={passwordInputId}
              className="font-semibold text-ink"
            >
              Current password
            </FieldLabel>
            <Input
              id={passwordInputId}
              aria-describedby={error ? passwordErrorId : passwordDescriptionId}
              aria-invalid={Boolean(error)}
              autoComplete="current-password"
              disabled={loading}
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              rightIcon={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  disabled={loading}
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </Button>
              }
            />
            {error ? (
              <FieldError id={passwordErrorId}>{error}</FieldError>
            ) : (
              <FieldDescription
                id={passwordDescriptionId}
                className="text-slate-muted text-xs leading-relaxed"
              >
                Verification remains valid for 15 minutes. You can keep
                reviewing admin data after it expires.
              </FieldDescription>
            )}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!password.trim() || loading}
              loading={loading}
            >
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
