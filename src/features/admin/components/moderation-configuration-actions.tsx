import { useMutation, useQueryClient } from "@tanstack/react-query";
import { History, Power, Rocket } from "lucide-react";
import { useRef, useState } from "react";

import { ModerationControlConfirmation } from "@/features/admin/components/moderation-control-confirmation";
import {
  getOperatorControlErrorKind,
  type OperatorModerationConfigurationDetail,
  type OperatorModerationConfigurationState,
  operatorControlMutations,
} from "@/features/operator/public/operator-governance";
import { Button } from "@/shared/components/ui/button";

interface ModerationConfigurationActionsProps {
  commandsEnabled: boolean;
  configuration: OperatorModerationConfigurationDetail;
  onCommandError: (error: unknown) => void;
  state: OperatorModerationConfigurationState;
}

export function ModerationConfigurationActions({
  commandsEnabled,
  configuration,
  onCommandError,
  state,
}: ModerationConfigurationActionsProps) {
  const queryClient = useQueryClient();
  const [activationOpen, setActivationOpen] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const activationKey = useRef<string | null>(null);
  const rollbackKey = useRef<string | null>(null);
  const activation = useMutation(
    operatorControlMutations.activateConfiguration(configuration.id, {
      onError: onCommandError,
      queryClient,
    }),
  );
  const rollback = useMutation(
    operatorControlMutations.rollbackConfiguration(configuration.id, {
      onError: onCommandError,
      queryClient,
    }),
  );
  const activeConfigurationId = state.activeConfigurationId;
  const activeConfigurationRowVersion = state.activeConfigurationRowVersion;

  if (configuration.status === "ACTIVE") {
    return null;
  }

  return (
    <section
      aria-labelledby="configuration-actions-heading"
      className="sticky bottom-4 z-20 grid gap-3 rounded-2xl bg-canvas/95 p-4 shadow-lg backdrop-blur sm:p-5"
    >
      <div className="grid gap-1">
        <h2
          id="configuration-actions-heading"
          className="flex items-center gap-2 font-semibold text-base text-ink"
        >
          <Rocket className="size-4 shrink-0" aria-hidden="true" />
          <span>Release controls</span>
        </h2>
        <p className="max-w-2xl text-slate-muted text-sm leading-relaxed">
          The server checks the current state again before accepting either
          command. Refresh if another admin changed the active version.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {configuration.status === "DRAFT" ? (
          <ModerationControlConfirmation
            actionLabel="Activate version"
            description={`Version ${configuration.version} will replace the current active version. Its rollout rules take effect only if the server's release checks pass.`}
            disabled={!commandsEnabled}
            errorMessage={controlErrorMessage(activation.error)}
            loading={activation.isPending}
            onConfirm={() => {
              activationKey.current ??= globalThis.crypto.randomUUID();
              activation.mutate(
                {
                  expectedActiveConfigurationId: state.activeConfigurationId,
                  expectedActiveConfigurationRowVersion:
                    state.activeConfigurationRowVersion,
                  expectedConfigurationRowVersion: configuration.rowVersion,
                  expectedStateRowVersion: state.stateRowVersion,
                  idempotencyKey: activationKey.current,
                  reasonCode: "POLICY_CONFIGURATION_ACTIVATE",
                },
                {
                  onSuccess: () => {
                    activationKey.current = null;
                    setActivationOpen(false);
                  },
                },
              );
            }}
            onOpenChange={(open) => {
              if (!activation.isPending) {
                activation.reset();
                if (!open) activationKey.current = null;
                setActivationOpen(open);
              }
            }}
            open={activationOpen}
            title={`Activate version ${configuration.version}?`}
          >
            <Button type="button" size="sm" disabled={!commandsEnabled}>
              <Power className="size-4" aria-hidden="true" />
              Activate version
            </Button>
          </ModerationControlConfirmation>
        ) : null}

        {configuration.status === "RETIRED" &&
        activeConfigurationId &&
        activeConfigurationRowVersion ? (
          <ModerationControlConfirmation
            actionLabel="Restore as new version"
            description={`The saved fields from version ${configuration.version} will be copied into a new active version. Version history will not be changed.`}
            disabled={!commandsEnabled}
            errorMessage={controlErrorMessage(rollback.error)}
            loading={rollback.isPending}
            onConfirm={() => {
              rollbackKey.current ??= globalThis.crypto.randomUUID();
              rollback.mutate(
                {
                  expectedActiveConfigurationId: activeConfigurationId,
                  expectedActiveConfigurationRowVersion:
                    activeConfigurationRowVersion,
                  expectedSourceConfigurationRowVersion:
                    configuration.rowVersion,
                  expectedStateRowVersion: state.stateRowVersion,
                  idempotencyKey: rollbackKey.current,
                  reasonCode: "POLICY_CONFIGURATION_ROLLBACK",
                },
                {
                  onSuccess: () => {
                    rollbackKey.current = null;
                    setRollbackOpen(false);
                  },
                },
              );
            }}
            onOpenChange={(open) => {
              if (!rollback.isPending) {
                rollback.reset();
                if (!open) rollbackKey.current = null;
                setRollbackOpen(open);
              }
            }}
            open={rollbackOpen}
            title={`Restore version ${configuration.version}?`}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!commandsEnabled}
            >
              <History className="size-4" aria-hidden="true" />
              Restore this version
            </Button>
          </ModerationControlConfirmation>
        ) : null}
      </div>
    </section>
  );
}

export function controlErrorMessage(error: unknown) {
  if (!error) return null;
  const kind = getOperatorControlErrorKind(error);
  if (kind === "STALE_VERSION") {
    return "The active version changed. Close this dialog, refresh, and review the latest state.";
  }
  if (kind === "STALE_SESSION") {
    return "Your recent admin verification has expired. Verify your access again before retrying.";
  }
  if (kind === "ACCESS_ENDED") {
    return "Your current admin access cannot make this change.";
  }
  if (kind === "MODEL_CONFLICT") {
    return "The saved evaluation does not belong to this exact configuration.";
  }
  if (kind === "NOT_FOUND") {
    return "This record is no longer available. Refresh the page before retrying.";
  }
  if (kind === "CONFLICT") {
    return "This change conflicts with the current server state. Refresh and review it again.";
  }
  return "The server did not accept this change. Nothing was released.";
}
