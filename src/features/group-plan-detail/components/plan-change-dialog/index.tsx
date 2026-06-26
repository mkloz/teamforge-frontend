import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  AlignLeft,
  Calendar,
  ChevronDown,
  DollarSign,
  MapPin,
  SendHorizontal,
  Tag,
  Type,
  X,
} from "lucide-react";
import { useState } from "react";
import type { CreateGroupPlanProposalPayload } from "@/features/group-plan-detail/api/group-plan-detail.api";
import { ProposalValueInput } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input";
import { usePlanChangeForm } from "@/features/group-plan-detail/components/plan-change-dialog/use-plan-change-form";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  getCurrentProposalValue,
  planProposalFieldOptions,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Notice } from "@/shared/components/ui/notice";
import type { PlanProposalField } from "@/shared/schemas/enums";

// ── Per-field icon map ────────────────────────────────────────────────────────

const FIELD_ICON: Record<PlanProposalField, LucideIcon> = {
  TITLE: Type,
  DESCRIPTION: AlignLeft,
  DATE_TIME: Calendar,
  LOCATION: MapPin,
  COST: DollarSign,
  CATEGORY: Tag,
};

type FieldHeaderVisualState = "open" | "closed";

const FIELD_HEADER_VISUALS = {
  open: {
    chevronClassName: "size-4 transition-colors duration-150 text-forge-teal",
    iconClassName: "transition-all duration-200 bg-forge-teal/15",
    iconTone: "teal",
    labelClassName:
      "block font-medium text-sm leading-snug transition-colors duration-150 text-forge-teal",
    rotate: 180,
  },
  closed: {
    chevronClassName:
      "size-4 transition-colors duration-150 text-slate-muted/40",
    iconClassName: "transition-all duration-200 text-slate-muted",
    iconTone: "none",
    labelClassName:
      "block font-medium text-sm leading-snug transition-colors duration-150 text-ink",
    rotate: 0,
  },
} satisfies Record<
  FieldHeaderVisualState,
  {
    chevronClassName: string;
    iconClassName: string;
    iconTone: "teal" | "none";
    labelClassName: string;
    rotate: number;
  }
>;

type PlanProposalFieldOption = (typeof planProposalFieldOptions)[number];
type PlanChangeFormState = ReturnType<typeof usePlanChangeForm>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface PlanChangeDialogProps {
  detail: GroupPlanDetail;
  disabled?: boolean;
  initialOpen?: boolean;
  isCreating: boolean;
  isOnline?: boolean;
  onCreate: (payload: CreateGroupPlanProposalPayload) => Promise<unknown>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PlanChangeDialog({
  detail,
  disabled = false,
  initialOpen = false,
  isCreating,
  isOnline = true,
  onCreate,
  onOpenChange,
  open,
}: PlanChangeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(initialOpen);
  const [expanded, setExpanded] = useState<PlanProposalField | null>(null);
  const isControlled = open !== undefined;
  const dialogOpen = open ?? internalOpen;

  const form = usePlanChangeForm({
    detail,
    onCreate,
    onSubmitted: () => handleOpenChange(false),
  });

  function collapseField() {
    setExpanded(null);
  }

  function toggleField(field: PlanProposalField) {
    if (expanded === field) {
      setExpanded(null);
      return;
    }
    form.handleFieldChange(field);
    setExpanded(field);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(isOpen);
    }
    if (!isOpen) {
      form.resetForm();
      setExpanded(null);
    }
    onOpenChange?.(isOpen);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || !form.plan}
          title={isOnline ? undefined : "Reconnect before suggesting changes."}
        >
          What would you change?
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto rounded-3xl bg-canvas p-0 sm:max-w-sm [&>button]:hidden">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 pt-6 pb-4">
          <div>
            <h2 className="font-semibold text-base text-ink">
              What would you change?
            </h2>
            <p className="mt-0.5 max-w-[22ch] text-slate-muted text-xs leading-relaxed">
              Tap a detail. Your idea goes to a group vote.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => handleOpenChange(false)}
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-slate-muted transition-colors hover:bg-black/8 hover:text-ink"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Accordion field list ───────────────────────────────── */}
        <ul aria-label="Plan fields" className="border-border/50 border-t">
          {planProposalFieldOptions.map((option, index) => (
            <PlanChangeFieldRow
              key={option.value}
              disabled={disabled}
              form={form}
              isCreating={isCreating}
              isLast={index === planProposalFieldOptions.length - 1}
              isOnline={isOnline}
              isOpen={expanded === option.value}
              option={option}
              onCollapse={collapseField}
              onToggle={() => toggleField(option.value)}
            />
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

interface PlanChangeFieldRowProps {
  disabled: boolean;
  form: PlanChangeFormState;
  isCreating: boolean;
  isLast: boolean;
  isOnline: boolean;
  isOpen: boolean;
  onCollapse: () => void;
  onToggle: () => void;
  option: PlanProposalFieldOption;
}

function PlanChangeFieldRow({
  disabled,
  form,
  isCreating,
  isLast,
  isOnline,
  isOpen,
  onCollapse,
  onToggle,
  option,
}: PlanChangeFieldRowProps) {
  const Icon = FIELD_ICON[option.value];
  const currentValue = form.plan
    ? getCurrentProposalValue(form.plan, option.value)
    : "";

  return (
    <li
      className={[
        "relative transition-colors duration-150",
        !isLast && "border-border/50 border-b",
        isOpen && "bg-forge-teal/[0.035]",
      ].join(" ")}
    >
      <PlanChangeFieldRail isOpen={isOpen} />
      <PlanChangeFieldHeader
        currentValue={currentValue}
        icon={Icon}
        isOpen={isOpen}
        option={option}
        onToggle={onToggle}
      />
      <PlanChangeFieldPanel
        currentValue={currentValue}
        disabled={disabled}
        form={form}
        isCreating={isCreating}
        isOnline={isOnline}
        isOpen={isOpen}
        option={option}
        onCollapse={onCollapse}
      />
    </li>
  );
}

function PlanChangeFieldRail({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={[
        "absolute top-0 bottom-0 left-0 w-[3px] rounded-r-full transition-all duration-300",
        isOpen ? "bg-forge-teal opacity-100" : "opacity-0",
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

interface PlanChangeFieldHeaderProps {
  currentValue: string;
  icon: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
  option: PlanProposalFieldOption;
}

function PlanChangeFieldHeader({
  currentValue,
  icon: Icon,
  isOpen,
  onToggle,
  option,
}: PlanChangeFieldHeaderProps) {
  const visualState = getFieldHeaderVisualState(isOpen);

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`field-body-${option.value}`}
      onClick={onToggle}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
    >
      <IconTile
        icon={Icon}
        size="sm"
        tone={visualState.iconTone}
        className={visualState.iconClassName}
        iconClassName="size-3.75"
      />

      <span className="min-w-0 flex-1">
        <span className={visualState.labelClassName}>{option.label}</span>
        <CollapsedFieldCurrentValue
          currentValue={currentValue}
          isOpen={isOpen}
        />
      </span>

      <motion.span
        animate={{ rotate: visualState.rotate }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="shrink-0"
        aria-hidden="true"
      >
        <ChevronDown
          className={visualState.chevronClassName}
          strokeWidth={1.75}
        />
      </motion.span>
    </button>
  );
}

function getFieldHeaderVisualState(isOpen: boolean) {
  return FIELD_HEADER_VISUALS[getFieldHeaderVisualStateKey(isOpen)];
}

function getFieldHeaderVisualStateKey(isOpen: boolean): FieldHeaderVisualState {
  return isOpen ? "open" : "closed";
}

function CollapsedFieldCurrentValue({
  currentValue,
  isOpen,
}: {
  currentValue: string;
  isOpen: boolean;
}) {
  if (isOpen || !currentValue) {
    return null;
  }

  return (
    <span className="mt-0.5 block truncate text-slate-muted text-xs">
      {currentValue}
    </span>
  );
}

interface PlanChangeFieldPanelProps {
  currentValue: string;
  disabled: boolean;
  form: PlanChangeFormState;
  isCreating: boolean;
  isOnline: boolean;
  isOpen: boolean;
  onCollapse: () => void;
  option: PlanProposalFieldOption;
}

function PlanChangeFieldPanel({
  currentValue,
  disabled,
  form,
  isCreating,
  isOnline,
  isOpen,
  onCollapse,
  option,
}: PlanChangeFieldPanelProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id={`field-body-${option.value}`}
          role="region"
          aria-label={`Edit ${option.label}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {
              height: {
                duration: 0.28,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
              opacity: { duration: 0.2, delay: 0.06 },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: { duration: 0.2, ease: [0.4, 0, 1, 1] },
              opacity: { duration: 0.12 },
            },
          }}
          className="overflow-hidden"
        >
          <PlanChangeFieldPanelContent
            currentValue={currentValue}
            disabled={disabled}
            form={form}
            isCreating={isCreating}
            isOnline={isOnline}
            option={option}
            onCollapse={onCollapse}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PlanChangeFieldPanelContentProps {
  currentValue: string;
  disabled: boolean;
  form: PlanChangeFormState;
  isCreating: boolean;
  isOnline: boolean;
  onCollapse: () => void;
  option: PlanProposalFieldOption;
}

function PlanChangeFieldPanelContent({
  currentValue,
  disabled,
  form,
  isCreating,
  isOnline,
  onCollapse,
  option,
}: PlanChangeFieldPanelContentProps) {
  return (
    <div className="px-5 pt-1 pb-5">
      {currentValue ? (
        <p className="mb-3 flex items-baseline gap-1.5 text-slate-muted text-xs">
          <span className="shrink-0 font-medium">Currently:</span>
          <span className="min-w-0 truncate">{currentValue}</span>
        </p>
      ) : null}

      <div id="plan-change-value-label" className="sr-only">
        {`New ${option.label}`}
      </div>
      <ProposalValueInput
        field={form.field}
        value={form.value}
        locationValue={form.locationValue}
        costValue={form.costValue}
        labelId="plan-change-value-label"
        onCostChange={form.setCostValue}
        onLocationChange={form.setLocationValue}
        onValueChange={form.setValue}
      />

      {form.error ? (
        <Notice
          id="plan-change-error"
          aria-live="polite"
          tone="danger"
          size="sm"
          icon={<AlertCircle className="size-3.5 shrink-0" />}
          className="mt-3 bg-destructive/8"
        >
          {form.error}
        </Notice>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className="text-slate-muted"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          loading={isCreating}
          disabled={disabled || !form.plan}
          title={isOnline ? undefined : "Reconnect before suggesting changes."}
          onClick={() => void form.submit()}
        >
          <SendHorizontal className="size-3.5" aria-hidden="true" />
          Send to group
        </Button>
      </div>
    </div>
  );
}
