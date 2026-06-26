import {
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
  ShieldAlert,
} from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button, type ButtonV2Props } from "@/shared/components/ui/button";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { captureException } from "@/shared/lib/telemetry";
import { cn } from "@/shared/lib/utils";

type ActionDialogTone = "danger" | "info" | "success" | "warning";

interface ActionDialogProps {
  cancelLabel?: string;
  children?: ReactNode;
  closeLabel?: string;
  closeOnConfirm?: boolean;
  confirmLabel?: string;
  confirmVariant?: ButtonV2Props["variant"];
  contentClassName?: string;
  description: ReactNode;
  details?: string[];
  disabled?: boolean;
  eyebrow?: string;
  icon?: ReactNode;
  loading?: boolean;
  onConfirm?: () => unknown;
  onContentClick?: MouseEventHandler<HTMLDivElement>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title: ReactNode;
  tone?: ActionDialogTone;
  trigger?: ReactNode;
}

const TONE_CONFIG = {
  danger: {
    defaultEyebrow: "Safety check",
    defaultIcon: ShieldAlert,
    iconClassName: "text-destructive",
    detailLabel: "Impact",
    ruleClassName: "border-destructive/45",
    confirmVariant: "destructive",
  },
  info: {
    defaultEyebrow: "Before you continue",
    defaultIcon: Info,
    iconClassName: "text-primary",
    detailLabel: "Worth knowing",
    ruleClassName: "border-primary/45",
    confirmVariant: "primary",
  },
  success: {
    defaultEyebrow: "Ready to confirm",
    defaultIcon: CheckCircle2,
    iconClassName: "text-primary",
    detailLabel: "What happens",
    ruleClassName: "border-primary/45",
    confirmVariant: "primary",
  },
  warning: {
    defaultEyebrow: "Quick check",
    defaultIcon: AlertTriangle,
    iconClassName: "text-accent",
    detailLabel: "Note",
    ruleClassName: "border-accent/45",
    confirmVariant: "secondary",
  },
} satisfies Record<
  ActionDialogTone,
  {
    confirmVariant: ButtonV2Props["variant"];
    defaultEyebrow: string;
    defaultIcon: LucideIcon;
    detailLabel: string;
    iconClassName: string;
    ruleClassName: string;
  }
>;

type ActionDialogToneConfig = (typeof TONE_CONFIG)[ActionDialogTone];

function getActionDialogTitleLabel(title: ReactNode) {
  return typeof title === "string" ? title : "Action dialog";
}

function hasActionDialogDetails(
  details: ActionDialogProps["details"],
): details is string[] {
  return Boolean(details?.length);
}

function getActionDialogRenderState({
  confirmVariant,
  internalLoading,
  loading,
  tone,
}: {
  confirmVariant: ActionDialogProps["confirmVariant"];
  internalLoading: boolean;
  loading: boolean;
  tone: ActionDialogTone;
}) {
  const config = TONE_CONFIG[tone];

  return {
    actionVariant: confirmVariant ?? config.confirmVariant,
    config,
    Icon: config.defaultIcon,
    isBusy: loading || internalLoading,
  };
}

interface ActionDialogConfirmState {
  disabled: boolean;
  isBusy: boolean;
  onConfirm: ActionDialogProps["onConfirm"];
}

function canRunActionDialogConfirm(
  state: ActionDialogConfirmState,
): state is ActionDialogConfirmState & { onConfirm: () => unknown } {
  return Boolean(state.onConfirm) && !state.disabled && !state.isBusy;
}

async function runActionDialogConfirm({
  closeOnConfirm,
  onConfirm,
  setDialogOpen,
}: {
  closeOnConfirm: boolean;
  onConfirm: () => unknown;
  setDialogOpen: (open: boolean) => void;
}) {
  await onConfirm();

  if (closeOnConfirm) {
    setDialogOpen(false);
  }
}

function ActionDialogHeading({
  config,
  description,
  eyebrow,
  icon,
  Icon,
  title,
}: {
  config: ActionDialogToneConfig;
  description: ReactNode;
  eyebrow: string | undefined;
  icon: ReactNode;
  Icon: LucideIcon;
  title: ReactNode;
}) {
  return (
    <div className="px-6 pt-6 pb-4">
      <AlertDialogHeader className="relative pr-9 text-left">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn("shrink-0", config.iconClassName)}
            aria-hidden="true"
          >
            {icon ?? <Icon className="size-4" strokeWidth={1.8} />}
          </span>
          <span className="block font-semibold text-slate-muted text-xs">
            {eyebrow ?? config.defaultEyebrow}
          </span>
          <span
            className={cn("h-px min-w-8 flex-1 border-t", config.ruleClassName)}
            aria-hidden="true"
          />
        </span>
        <AlertDialogTitle className="mt-3 max-w-80 text-balance font-black text-ink text-xl leading-tight">
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="mt-2 max-w-88 text-sm leading-relaxed">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>
    </div>
  );
}

function ActionDialogDetails({
  config,
  details,
}: {
  config: ActionDialogToneConfig;
  details: ActionDialogProps["details"];
}) {
  if (!hasActionDialogDetails(details)) {
    return null;
  }

  return (
    <div className="mx-6 mb-4 border-border/60 border-t pt-4">
      <p className={cn("font-semibold text-xs", config.iconClassName)}>
        {config.detailLabel}
      </p>
      <ul className="mt-2 grid gap-1.5">
        {details.map((detail) => (
          <li key={detail} className="text-slate-muted text-sm leading-relaxed">
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActionDialogChildren({ children }: { children: ReactNode }) {
  return children ? <div className="px-6 pb-4">{children}</div> : null;
}

function ActionDialogActions({
  actionVariant,
  cancelLabel,
  closeLabel,
  confirmLabel,
  disabled,
  isBusy,
  onClose,
  onConfirm,
}: {
  actionVariant: ButtonV2Props["variant"];
  cancelLabel: string;
  closeLabel: string;
  confirmLabel: string;
  disabled: boolean;
  isBusy: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  if (!onConfirm) {
    return (
      <Button type="button" variant="primary" onClick={onClose}>
        {closeLabel}
      </Button>
    );
  }

  return (
    <>
      <AlertDialogCancel disabled={isBusy} className="rounded-md">
        {cancelLabel}
      </AlertDialogCancel>
      <Button
        type="button"
        variant={actionVariant}
        loading={isBusy}
        disabled={disabled || isBusy}
        className="rounded-md"
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </>
  );
}

export function ActionDialog({
  cancelLabel = "Keep working",
  children,
  closeLabel = "Got it",
  closeOnConfirm = true,
  confirmLabel = "Confirm",
  confirmVariant,
  contentClassName,
  description,
  details,
  disabled = false,
  eyebrow,
  icon,
  loading = false,
  onConfirm,
  onContentClick,
  onOpenChange,
  open,
  title,
  tone = "info",
  trigger,
}: ActionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const { actionVariant, config, Icon, isBusy } = getActionDialogRenderState({
    confirmVariant,
    internalLoading,
    loading,
    tone,
  });
  const isControlled = open !== undefined;
  const dialogOpen = open ?? internalOpen;

  function setDialogOpen(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  async function handleConfirm() {
    const confirmState = { disabled, isBusy, onConfirm };

    if (!canRunActionDialogConfirm(confirmState)) {
      return;
    }

    setInternalLoading(true);

    try {
      await runActionDialogConfirm({
        closeOnConfirm,
        onConfirm: confirmState.onConfirm,
        setDialogOpen,
      });
    } catch (error) {
      captureException("ui.action-dialog.confirm", error, {
        title: getActionDialogTitleLabel(title),
      });
      showAppErrorToast(error);
    } finally {
      setInternalLoading(false);
    }
  }

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent
        onClick={onContentClick}
        className={cn(
          "w-[calc(100%-2rem)] overflow-hidden rounded-md border-border/80 bg-canvas p-0 shadow-none sm:max-w-md [&>button]:top-4 [&>button]:right-4 [&>button]:shadow-none",
          contentClassName,
        )}
      >
        <ActionDialogHeading
          config={config}
          description={description}
          eyebrow={eyebrow}
          icon={icon}
          Icon={Icon}
          title={title}
        />

        <ActionDialogDetails config={config} details={details} />

        <ActionDialogChildren>{children}</ActionDialogChildren>

        <AlertDialogFooter className="bg-transparent px-6 pt-2 pb-6 sm:justify-between">
          <ActionDialogActions
            actionVariant={actionVariant}
            cancelLabel={cancelLabel}
            closeLabel={closeLabel}
            confirmLabel={confirmLabel}
            disabled={disabled}
            isBusy={isBusy}
            onClose={() => setDialogOpen(false)}
            onConfirm={
              onConfirm
                ? () => {
                    void handleConfirm();
                  }
                : undefined
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
