import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { CalendarDays, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";

import { PlanParticipantApi } from "@/features/group-plan-detail/public/plan-participant-api";
import { refreshAuthSession } from "@/shared/api/api";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";

export function ExternalInviteTokenPage() {
  const params = useParams({ strict: false }) as { token?: string };
  const navigate = useNavigate();
  const [attempted, setAttempted] = useState(false);
  const { isError: exchangeIsError, mutate: exchangeInvite } = useMutation({
    mutationFn: (token: string) =>
      PlanParticipantApi.exchangeExternalInvite(token),
  });

  useEffect(() => {
    if (!params.token || attempted) return;
    setAttempted(true);
    exchangeInvite(params.token, {
      onSuccess: () => void navigate({ to: "/invite", replace: true }),
    });
  }, [attempted, exchangeInvite, navigate, params.token]);

  return (
    <InviteShell>
      {exchangeIsError ? (
        <Notice role="alert" tone="warning">
          This invitation is invalid, expired, or its place has already been
          taken.
        </Notice>
      ) : (
        <p className="text-center text-muted-foreground text-sm">
          Opening your private invitation…
        </p>
      )}
    </InviteShell>
  );
}

export function ExternalInvitePage() {
  const { isAuthenticated } = useAuthSessionState();
  const navigate = useNavigate();
  const [suppressed, setSuppressed] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(isAuthenticated);

  useEffect(() => {
    if (sessionChecked || isAuthenticated) return;
    void refreshAuthSession().finally(() => setSessionChecked(true));
  }, [isAuthenticated, sessionChecked]);
  const preview = useQuery({
    queryKey: ["external-invite", "preview"],
    queryFn: () => PlanParticipantApi.getExternalInvitePreview(),
    retry: false,
    staleTime: 30_000,
  });
  const claim = useMutation({
    mutationFn: () => PlanParticipantApi.claimExternalInvite(),
    onSuccess: (result) =>
      void navigate({
        to: "/plans/$planId/guest",
        params: { planId: result.planId },
        replace: true,
      }),
  });
  const suppress = useMutation({
    mutationFn: (report: boolean) =>
      PlanParticipantApi.suppressExternalInvite(report),
    onSuccess: () => setSuppressed(true),
  });

  if (suppressed) {
    return (
      <InviteShell>
        <ShieldCheck className="mx-auto size-8 text-forge-teal" aria-hidden />
        <h1 className="mt-4 text-center font-bold text-ink text-xl">
          Invitation hidden
        </h1>
        <p className="mt-2 text-center text-muted-foreground text-sm">
          Links from this sender will stay hidden in this browser.
        </p>
      </InviteShell>
    );
  }

  if (preview.isLoading) {
    return (
      <InviteShell>
        <p className="text-center text-muted-foreground text-sm">
          Loading invitation…
        </p>
      </InviteShell>
    );
  }

  if (preview.isError || !preview.data) {
    return (
      <InviteShell>
        <Notice role="alert" tone="warning">
          This invitation is no longer available.
        </Notice>
      </InviteShell>
    );
  }

  const invite = preview.data;
  return (
    <InviteShell>
      <div className="flex size-11 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
        <UsersRound className="size-5" aria-hidden />
      </div>
      <p className="mt-5 font-semibold text-forge-teal text-xs uppercase tracking-[0.16em]">
        Plan invitation
      </p>
      <h1 className="mt-2 font-bold text-2xl text-ink">{invite.planTitle}</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        {invite.groupName} has invited you to take one available place in this
        plan.
      </p>
      <div className="mt-5 grid gap-3 rounded-xl bg-muted/60 p-4 text-sm">
        <p className="flex items-center gap-2 text-ink">
          <CalendarDays className="size-4 text-forge-teal" aria-hidden />
          {formatDateTime(invite.dateTime)}
        </p>
        <p className="flex items-center gap-2 text-ink">
          <MapPin className="size-4 text-forge-teal" aria-hidden />
          {formatLocationMode(invite.locationMode)}
        </p>
      </div>
      <Notice className="mt-5" size="sm">
        Accepting gives you access to this plan only. It does not add you to the
        group or its chat.
      </Notice>
      {!sessionChecked ? (
        <Button className="mt-5 w-full" disabled>
          Checking account…
        </Button>
      ) : isAuthenticated ? (
        <Button
          className="mt-5 w-full"
          disabled={claim.isPending}
          onClick={() => claim.mutate()}
        >
          {claim.isPending ? "Claiming place…" : "Accept plan place"}
        </Button>
      ) : (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button asChild>
            <Link to="/auth/register" search={{ returnTo: "/invite" }}>
              Create account
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/auth/login" search={{ returnTo: "/invite" }}>
              Sign in
            </Link>
          </Button>
        </div>
      )}
      {claim.isError ? (
        <Notice className="mt-3" role="alert" size="sm" tone="warning">
          We couldn&apos;t claim this place. Complete account setup or check
          whether the invitation is still open.
        </Notice>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3 text-xs">
        <button
          className="text-muted-foreground underline-offset-4 hover:underline"
          disabled={suppress.isPending}
          onClick={() => suppress.mutate(false)}
          type="button"
        >
          Hide sender
        </button>
        <button
          className="text-destructive underline-offset-4 hover:underline"
          disabled={suppress.isPending}
          onClick={() => suppress.mutate(true)}
          type="button"
        >
          Report link
        </button>
      </div>
    </InviteShell>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-border/70 bg-card p-6 shadow-xl sm:p-8">
        {children}
      </section>
    </main>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "Time being confirmed";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLocationMode(value: string) {
  if (value === "ONLINE") return "Online";
  if (value === "TBD") return "Location being confirmed";
  return "In person — details appear after acceptance";
}
