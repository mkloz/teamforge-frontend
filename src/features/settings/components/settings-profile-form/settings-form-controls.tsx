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
import { cn } from "@/shared/lib/utils";
import type { AuthSession, User } from "@/shared/schemas";
import { LaptopMinimal, LogOut, Smartphone, Trash2 } from "lucide-react";

function formatSessionTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function describeSessionDevice(session: AuthSession) {
  const userAgent = session.userAgent?.toLowerCase() ?? "";
  const isMobile =
    userAgent.includes("iphone") ||
    userAgent.includes("android") ||
    userAgent.includes("mobile");

  return {
    label: isMobile ? "Mobile session" : "Browser session",
    icon: isMobile ? Smartphone : LaptopMinimal,
  };
}

export function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-canvas px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">
        {value ?? "Not set"}
      </p>
    </div>
  );
}

export function SessionRow({
  session,
  isRevoking,
  onRevoke,
}: {
  session: AuthSession;
  isRevoking: boolean;
  onRevoke: (session: AuthSession) => Promise<void>;
}) {
  const device = describeSessionDevice(session);
  const DeviceIcon = device.icon;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-canvas p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-full border border-border bg-card p-2 text-slate-muted">
          <DeviceIcon size={16} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{device.label}</p>
            {session.isCurrent && (
              <span className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-2 py-0.5 text-[11px] font-semibold text-forge-teal">
                Current
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-muted">
            Started {formatSessionTime(session.createdAt)}
          </p>
          <p className="mt-1 text-xs text-slate-muted">
            Expires {formatSessionTime(session.expiresAt)}
          </p>
          {session.ipAddress && (
            <p className="mt-1 text-xs text-slate-muted">
              IP {session.ipAddress}
            </p>
          )}
          {session.userAgent && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-muted">
              {session.userAgent}
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className={
          session.isCurrent
            ? "border-destructive/40 text-destructive hover:bg-destructive/10"
            : undefined
        }
        disabled={isRevoking}
        onClick={() => {
          void onRevoke(session);
        }}
      >
        <LogOut size={14} />
        {isRevoking
          ? "Signing out..."
          : session.isCurrent
            ? "Sign out here"
            : "Revoke"}
      </Button>
    </div>
  );
}

export function NotificationPreferenceRow({
  checked,
  title,
  description,
  onToggle,
  disabled,
}: {
  checked: boolean;
  title: string;
  description: string;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition-colors",
        checked
          ? "border-forge-teal/25 bg-forge-teal/8"
          : "border-border/70 bg-canvas",
        disabled && "cursor-not-allowed opacity-70",
      )}
    >
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-muted">
          {description}
        </p>
      </div>

      <div
        className={cn(
          "relative h-7 w-12 rounded-full border transition-colors",
          checked
            ? "border-forge-teal/30 bg-forge-teal"
            : "border-border bg-card",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-0.5",
          )}
        />
      </div>
    </button>
  );
}

export function MatchingThresholdControl({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const valueLabel = value === 0 ? "Open" : `${value}%`;

  return (
    <div className="rounded-2xl border border-border/70 bg-canvas p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink">
            Minimum compatibility
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-muted">
            Raise this to make automatic matches stricter. Very high limits can
            slow down group formation.
          </p>
        </div>
        <div className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 py-1 text-sm font-bold text-forge-teal">
          {valueLabel}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={95}
        step={5}
        value={value}
        disabled={disabled}
        aria-label="Minimum compatibility score"
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-5 h-2 w-full accent-forge-teal disabled:opacity-60"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {[0, 70, 80, 90].map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={value === preset ? "primary" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => onChange(preset)}
          >
            {preset === 0
              ? "Open"
              : preset === 70
                ? "Balanced"
                : preset === 80
                  ? "Strong"
                  : "Strict"}{" "}
            {preset > 0 ? `${preset}%` : ""}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function DeleteAccountSection({
  currentUser,
  isDeleting,
  error,
  onDelete,
}: {
  currentUser: User | undefined;
  isDeleting: boolean;
  error: string | null;
  onDelete: () => Promise<void>;
}) {
  const [confirmation, setConfirmation] = useState("");
  const canDelete = confirmation === "DELETE";

  return (
    <section className="rounded-2xl border border-destructive/30 bg-card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-ink">Delete account</h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-muted">
            This signs you out, disables automatic matching, removes active
            sessions, and anonymizes your sign-in identifiers. Your existing
            group history may remain where other members need context.
          </p>
          {error ? (
            <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
          ) : null}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
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
                disabled={!canDelete || isDeleting}
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
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
