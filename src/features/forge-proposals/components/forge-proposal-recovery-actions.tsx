import { useNavigate } from "@tanstack/react-router";
import { Check, Clock3, RefreshCw, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useForgeProposalRecovery } from "@/features/forge-proposals/hooks/use-forge-proposal-recovery";
import type { ForgeProposal } from "@/features/forge-proposals/lib/forge-proposal-contract";
import type { FormationOpeningOrganizerApplication } from "@/shared/api/formation-opening-api";
import { Avatar } from "@/shared/components/common/avatar";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import { buildForgeProposalNavigation } from "@/shared/navigation";

interface ForgeProposalRecoveryActionsProps {
  proposal: ForgeProposal;
  proposalRefreshFailed?: boolean;
}

export function ForgeProposalRecoveryActions({
  proposal,
  proposalRefreshFailed = false,
}: ForgeProposalRecoveryActionsProps) {
  const navigate = useNavigate();
  const recovery = useForgeProposalRecovery(proposal);
  const summary = proposal.recovery;

  useEffect(() => {
    if (!recovery.successorProposalId) return;

    void navigate({
      ...buildForgeProposalNavigation(recovery.successorProposalId),
      replace: true,
    });
  }, [navigate, recovery.successorProposalId]);

  if (!summary || summary.viewerStatus !== "ORGANIZER_ACTION") {
    return null;
  }

  if (recovery.openingIsLoading) {
    return <RecoveryManagerLoading />;
  }

  if (recovery.openingIsError) {
    const status = getHttpErrorStatus(recovery.openingError);
    return (
      <RecoveryStatus
        message={
          status === 404 || status === 410
            ? "This opening has ended. A smaller group was not created."
            : "We couldn't refresh this opening. Check your connection and try again."
        }
        onRefresh={recovery.refreshRecovery}
      />
    );
  }

  if (recovery.opening) {
    if (recovery.opening.viewerRole !== "ORGANIZER") {
      return (
        <RecoveryStatus
          message="This opening is no longer available. We refreshed the proposal status."
          onRefresh={recovery.refreshRecovery}
        />
      );
    }

    return (
      <RecoveryManager
        activeAction={recovery.activeAction}
        error={
          recovery.error?.message ??
          recovery.openingRefreshError ??
          (proposalRefreshFailed
            ? "We couldn't refresh this proposal. The last loaded details are still shown."
            : null)
        }
        isOnline={recovery.isOnline}
        onClose={recovery.closeOpening}
        onSelect={recovery.selectApplicant}
        opening={recovery.opening}
      />
    );
  }

  if (!summary.eligible) {
    return (
      <RecoveryStatus
        message="This proposal can no longer open another place. A smaller group was not created."
        onRefresh={recovery.refreshRecovery}
      />
    );
  }

  return (
    <div className="grid w-full gap-3">
      <p className="text-muted-foreground text-sm leading-relaxed">
        The proposal ended one person short. You can open one public place, or
        leave the proposal closed. TeamForge will not create a smaller group.
      </p>
      <div className="flex flex-wrap gap-3">
        <ActionDialog
          tone="info"
          eyebrow="One place short"
          title="Open one public place?"
          description="People can request the place for a limited time. You will choose one person, then everyone in the final roster must confirm the new proposal before the group forms."
          confirmLabel="Open one place"
          cancelLabel="Not now"
          loading={recovery.activeAction === "open"}
          disabled={!recovery.isOnline || recovery.activeAction !== null}
          closeOnConfirm={false}
          onConfirm={recovery.openOnePlace}
          trigger={
            <Button
              disabled={!recovery.isOnline || recovery.activeAction !== null}
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Open one place
            </Button>
          }
        />
      </div>
      <RecoveryMessage
        error={
          recovery.error?.message ??
          (proposalRefreshFailed
            ? "We couldn't refresh this proposal. The last loaded details are still shown."
            : null)
        }
        isOnline={recovery.isOnline}
      />
    </div>
  );
}

interface RecoveryManagerProps {
  activeAction: "close" | "open" | "select" | null;
  error: string | null;
  isOnline: boolean;
  onClose: (openingVersion: number) => Promise<boolean>;
  onSelect: (input: {
    applicationId: string;
    applicationVersion: number;
    openingVersion: number;
  }) => Promise<boolean>;
  opening: Extract<
    NonNullable<ReturnType<typeof useForgeProposalRecovery>["opening"]>,
    { viewerRole: "ORGANIZER" }
  >;
}

function RecoveryManager({
  activeAction,
  error,
  isOnline,
  onClose,
  onSelect,
  opening,
}: RecoveryManagerProps) {
  const isActive =
    opening.state === "OPEN" || opening.state === "APPLICATION_PENDING";
  const pendingApplications = opening.applications.filter(
    (application) => application.state === "PENDING",
  );

  if (!isActive) {
    return (
      <RecoveryStatus
        message={
          opening.state === "FINAL_PROPOSAL_CREATED" ||
          opening.state === "FILLED"
            ? "The final roster is ready for review. Opening the new proposal now."
            : "This opening has ended. A smaller group was not created."
        }
      />
    );
  }

  return (
    <section className="grid w-full gap-4" aria-labelledby="recovery-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="recovery-heading" className="font-bold text-foreground">
            One public place is open
          </h2>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            Choose one person to create a new proposal. Everyone in that final
            roster will review it before the group forms.
          </p>
        </div>
        <StatusPill icon={Clock3} tone="neutral" surface="soft" size="sm">
          Closes {formatRecoveryTime(opening.expiresAt)}
        </StatusPill>
      </div>

      <div className="border-border/70 border-y">
        {pendingApplications.length > 0 ? (
          pendingApplications.map((application) => (
            <ApplicantRow
              key={application.id}
              application={application}
              disabled={!isOnline || activeAction !== null}
              loading={activeAction === "select"}
              onSelect={() =>
                onSelect({
                  applicationId: application.id,
                  applicationVersion: application.version,
                  openingVersion: opening.version,
                })
              }
            />
          ))
        ) : (
          <p className="py-5 text-muted-foreground text-sm">No requests yet</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ActionDialog
          tone="warning"
          eyebrow="Close the opening"
          title="Close this public place?"
          description="No one will be added and TeamForge will not create a smaller group."
          confirmLabel="Close opening"
          confirmVariant="outline"
          cancelLabel="Keep it open"
          loading={activeAction === "close"}
          disabled={!isOnline || activeAction !== null}
          closeOnConfirm={false}
          onConfirm={() => onClose(opening.version)}
          trigger={
            <Button
              variant="outline"
              disabled={!isOnline || activeAction !== null}
            >
              <X className="size-4" aria-hidden="true" />
              Close opening
            </Button>
          }
        />
      </div>

      <RecoveryMessage error={error} isOnline={isOnline} />
    </section>
  );
}

function ApplicantRow({
  application,
  disabled,
  loading,
  onSelect,
}: {
  application: FormationOpeningOrganizerApplication;
  disabled: boolean;
  loading: boolean;
  onSelect: () => Promise<boolean>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const applicant = application.applicant;

  return (
    <div className="flex flex-col gap-3 border-border/70 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          src={applicant.avatar}
          name={applicant.name}
          imageSize={48}
          className="size-12"
        />
        <div className="min-w-0">
          <p className="truncate font-bold text-foreground text-sm">
            {applicant.name}
          </p>
          {applicant.city ? (
            <p className="mt-0.5 truncate text-muted-foreground text-xs">
              {applicant.city}
            </p>
          ) : null}
          {applicant.interests.length > 0 ? (
            <p className="mt-1 line-clamp-1 text-muted-foreground text-xs">
              {applicant.interests.join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <ActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tone="info"
        eyebrow="Final roster"
        title={`Choose ${applicant.name}?`}
        description={`Selecting ${applicant.name} creates a new proposal with the final roster. Everyone must confirm it before the group forms.`}
        confirmLabel="Select this person"
        cancelLabel="Keep reviewing"
        loading={loading}
        disabled={disabled}
        closeOnConfirm={false}
        onConfirm={async () => {
          if (await onSelect()) setDialogOpen(false);
        }}
        trigger={
          <Button size="sm" disabled={disabled}>
            <Check className="size-4" aria-hidden="true" />
            Select
          </Button>
        }
      />
    </div>
  );
}

function RecoveryStatus({
  message,
  onRefresh,
}: {
  message: string;
  onRefresh?: () => Promise<void>;
}) {
  return (
    <Notice
      tone="neutral"
      size="sm"
      action={
        onRefresh ? (
          <Button variant="ghost" size="xs" onClick={() => void onRefresh()}>
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Refresh
          </Button>
        ) : undefined
      }
    >
      <p>{message}</p>
    </Notice>
  );
}

function RecoveryMessage({
  error,
  isOnline,
}: {
  error: string | null;
  isOnline: boolean;
}) {
  const message =
    error ?? (isOnline ? null : "Reconnect before changing this opening.");

  return message ? (
    <p className="text-muted-foreground text-sm" role="status">
      {message}
    </p>
  ) : null;
}

function RecoveryManagerLoading() {
  return (
    <div className="grid w-full gap-3" role="status">
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-14 w-full" />
      <span className="sr-only">Loading the open place...</span>
    </div>
  );
}

function formatRecoveryTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
