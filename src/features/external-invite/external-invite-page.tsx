import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { CalendarDays, EyeOff, Flag, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { PlanParticipantApi } from "@/features/group-plan-detail/public/plan-participant-api";
import { refreshAuthSession } from "@/shared/api/api";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Notice } from "@/shared/components/ui/notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getPlanCategoryPresentation } from "@/shared/lib/plan-category-presentation";
import { planCategorySchema } from "@/shared/schemas/enums";

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
    const token = params.token;
    setAttempted(true);
    window.history.replaceState(window.history.state, "", "/invite");
    exchangeInvite(token, {
      onSuccess: () => void navigate({ to: "/invite", replace: true }),
    });
  }, [attempted, exchangeInvite, navigate, params.token]);

  return (
    <CenteredInviteState>
      {exchangeIsError ? (
        <Notice role="alert" tone="warning" statusIcon>
          This invitation is invalid, expired, or its place has already been
          taken.
        </Notice>
      ) : (
        <div aria-live="polite" className="grid gap-3">
          <Skeleton className="mx-auto size-10" shape="circle" tone="teal" />
          <p className="text-center text-muted-foreground text-sm">
            Opening your private invitation…
          </p>
        </div>
      )}
    </CenteredInviteState>
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
      <CenteredInviteState>
        <ShieldCheck
          className="mx-auto size-7 text-muted-foreground"
          aria-hidden
        />
        <h1 className="mt-4 text-center font-bold text-ink text-xl">
          Invitation hidden
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-center text-muted-foreground text-sm">
          Links from this sender will stay hidden in this browser.
        </p>
      </CenteredInviteState>
    );
  }

  if (preview.isLoading) return <InvitePageSkeleton />;

  if (preview.isError || !preview.data) {
    return (
      <CenteredInviteState>
        <Notice role="alert" tone="warning" statusIcon>
          This invitation is no longer available.
        </Notice>
      </CenteredInviteState>
    );
  }

  const invite = preview.data;
  const parsedCategory = planCategorySchema.safeParse(invite.category);
  const category = getPlanCategoryPresentation(
    parsedCategory.success ? parsedCategory.data : "OTHER",
  );
  const CategoryIcon = category.icon;

  return (
    <main className="min-h-dvh bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-5xl overflow-hidden rounded-3xl bg-card lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]">
        <aside
          className={`relative flex min-h-52 flex-col justify-end overflow-hidden bg-linear-to-br ${category.gradient} p-6 text-white sm:min-h-64 lg:min-h-full lg:p-8`}
        >
          <CategoryIcon
            aria-hidden
            className="absolute top-6 right-6 size-24 opacity-15 lg:size-32"
          />
          <p className="font-semibold text-sm text-white/75">
            {category.label}
          </p>
          <p className="mt-2 max-w-sm font-extrabold text-2xl leading-tight sm:text-3xl">
            One place, shared directly with you.
          </p>
        </aside>

        <section className="flex min-w-0 flex-col justify-center p-5 sm:p-8 lg:p-10">
          <p className="font-semibold text-muted-foreground text-sm">
            Private plan invitation
          </p>
          <h1 className="mt-2 text-balance font-extrabold text-3xl text-ink tracking-tight sm:text-4xl">
            {invite.planTitle}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground text-sm leading-relaxed sm:text-base">
            {invite.groupName} saved one available plan place for you.
          </p>

          <GroupedMenuList className="mt-6">
            <GroupedMenuItem>
              <GroupedMenuAction className="min-h-14 px-4">
                <CalendarDays className="size-4 shrink-0" aria-hidden />
                <span className="font-semibold text-ink text-sm">
                  {formatDateTime(invite.dateTime)}
                </span>
              </GroupedMenuAction>
            </GroupedMenuItem>
            <GroupedMenuItem>
              <GroupedMenuAction className="min-h-14 px-4">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span className="font-semibold text-ink text-sm">
                  {formatLocationMode(invite.locationMode)}
                </span>
              </GroupedMenuAction>
            </GroupedMenuItem>
          </GroupedMenuList>

          <Notice className="mt-4" size="sm">
            Accepting opens this plan only. Group chat, member lists, and group
            history stay private.
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

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              disabled={suppress.isPending}
              onClick={() => suppress.mutate(false)}
              size="sm"
              variant="ghost"
            >
              <EyeOff className="size-4" aria-hidden />
              Hide sender
            </Button>
            <Button
              disabled={suppress.isPending}
              onClick={() => suppress.mutate(true)}
              size="sm"
              variant="ghost"
            >
              <Flag className="size-4" aria-hidden />
              Report link
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

function InvitePageSkeleton() {
  return (
    <main className="min-h-dvh bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-5xl overflow-hidden rounded-3xl bg-card lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]">
        <Skeleton className="min-h-52 rounded-none lg:min-h-full" tone="teal" />
        <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-4 h-10 w-4/5" />
          <Skeleton className="mt-3 h-5 w-3/5" />
          <Skeleton className="mt-7 h-28 w-full" shape="card" />
          <Skeleton className="mt-5 h-11 w-full" />
        </div>
      </div>
    </main>
  );
}

function CenteredInviteState({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl bg-card p-6 sm:p-8">
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
  return "In person · exact details after acceptance";
}
