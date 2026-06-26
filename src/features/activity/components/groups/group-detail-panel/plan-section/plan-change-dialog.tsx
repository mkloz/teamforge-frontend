import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  AlignLeft,
  Calendar,
  ChevronDown,
  MapPin,
  SendHorizontal,
  Type,
  X,
} from "lucide-react";
import type { ReactElement } from "react";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { LOCATION_MODE_LABELS } from "@/features/activity/lib/plan-location";
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { Button } from "@/shared/components/ui/button";
import { DateTimeInput } from "@/shared/components/ui/datetime-input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Input } from "@/shared/components/ui/input";
import { Notice } from "@/shared/components/ui/notice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  getCurrentProposalValue,
  isProposalField,
  PLAN_PROPOSAL_FIELD_OPTIONS,
  type ProposalField,
} from "./plan-proposal-fields";
import { usePlanProposalForm } from "./use-plan-proposal-form";

// ── Field icon map ────────────────────────────────────────────────────────────

const FIELD_ICON: Record<ProposalField, LucideIcon> = {
  TITLE: Type,
  DESCRIPTION: AlignLeft,
  DATE_TIME: Calendar,
  LOCATION: MapPin,
};

type PlanProposalForm = ReturnType<typeof usePlanProposalForm>;
type PlanProposalFieldOption = (typeof PLAN_PROPOSAL_FIELD_OPTIONS)[number];
type ProposalLocationValue = PlanProposalForm["locationValue"];

interface PlanLocationSelection {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
}

function getLocationValueFromSelection(
  current: ProposalLocationValue,
  location: PlanLocationSelection | null,
): ProposalLocationValue {
  if (!location) {
    return {
      ...current,
      location: "",
      locationLat: null,
      locationLng: null,
    };
  }

  return {
    ...current,
    location: location.address,
    locationLat: location.lat,
    locationLng: location.lng,
  };
}

function getLocationValueFromLink(
  current: ProposalLocationValue,
  value: string,
): ProposalLocationValue {
  return {
    ...current,
    location: value,
    locationLat: null,
    locationLng: null,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PlanChangeDialogProps {
  className?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  plan: Plan;
  trigger?: ReactElement | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PlanChangeDialog({
  className,
  onOpenChange,
  open,
  plan,
  trigger,
}: PlanChangeDialogProps) {
  const form = usePlanProposalForm(plan, { onOpenChange, open });

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.openForm();
      return;
    }
    form.closeForm();
  }

  function handleLocationModeChange(locationMode: string) {
    if (!isPlanLocationMode(locationMode)) return;
    form.setLocationValue((current) => ({
      ...current,
      location: locationMode === "TBD" ? "" : current.location,
      locationLat: null,
      locationLng: null,
      locationMode,
    }));
  }

  return (
    <Dialog open={form.isOpen} onOpenChange={handleOpenChange}>
      {trigger !== null ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              variant="primary"
              size="xs"
              className={className}
              contentClassName="gap-1.5"
            >
              <Type className="size-3.5" aria-hidden="true" />
              <span className="truncate">Suggest</span>
            </Button>
          )}
        </DialogTrigger>
      ) : null}

      <DialogContent className="max-h-[90svh] overflow-y-auto rounded-3xl bg-popover p-0 sm:max-w-sm [&>button]:hidden">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 pt-6 pb-4">
          <div>
            <h2 className="font-semibold text-base text-ink">
              What would you change?
            </h2>
            <p className="mt-0.5 max-w-[24ch] text-slate-muted text-xs leading-relaxed">
              Tap a detail. Your idea goes to a group vote.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={form.closeForm}
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-slate-muted transition-colors hover:bg-muted hover:text-ink"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Accordion field list ──────────────────────────────── */}
        <ul aria-label="Plan fields" className="border-border/50 border-t">
          {PLAN_PROPOSAL_FIELD_OPTIONS.map((option, index) => (
            <PlanFieldItem
              key={option.value}
              currentValue={getCurrentProposalValue(plan, option.value)}
              form={form}
              isLast={index === PLAN_PROPOSAL_FIELD_OPTIONS.length - 1}
              option={option}
              onLocationModeChange={handleLocationModeChange}
            />
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

// ── Field row components ─────────────────────────────────────────────────────

interface PlanFieldItemProps {
  currentValue: string;
  form: PlanProposalForm;
  isLast: boolean;
  onLocationModeChange: (mode: string) => void;
  option: PlanProposalFieldOption;
}

function PlanFieldItem({
  currentValue,
  form,
  isLast,
  onLocationModeChange,
  option,
}: PlanFieldItemProps) {
  const Icon = FIELD_ICON[option.value];
  const isExpanded = form.field === option.value && form.isOpen;

  return (
    <li
      className={[
        "relative transition-colors duration-150",
        !isLast && "border-border/50 border-b",
        isExpanded && "bg-forge-teal/[0.03]",
      ].join(" ")}
    >
      <PlanFieldAccent isExpanded={isExpanded} />
      <PlanFieldTrigger
        currentValue={currentValue}
        Icon={Icon}
        isExpanded={isExpanded}
        onSelect={() => {
          if (isProposalField(option.value)) {
            form.handleFieldChange(option.value);
          }
        }}
        option={option}
      />
      <PlanFieldBody
        currentValue={currentValue}
        form={form}
        isExpanded={isExpanded}
        onLocationModeChange={onLocationModeChange}
        option={option}
      />
    </li>
  );
}

function PlanFieldAccent({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "absolute top-0 bottom-0 left-0 w-[3px] rounded-r-full transition-all duration-300",
        isExpanded ? "bg-forge-teal opacity-100" : "opacity-0",
      ].join(" ")}
    />
  );
}

interface PlanFieldTriggerProps {
  currentValue: string;
  Icon: LucideIcon;
  isExpanded: boolean;
  onSelect: () => void;
  option: PlanProposalFieldOption;
}

function PlanFieldTrigger({
  currentValue,
  Icon,
  isExpanded,
  onSelect,
  option,
}: PlanFieldTriggerProps) {
  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-controls={`field-body-${option.value}`}
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
    >
      <IconTile
        icon={Icon}
        iconClassName="size-3.75"
        size="sm"
        shape="square"
        tone={isExpanded ? "teal" : "none"}
        className={isExpanded ? "bg-forge-teal/15" : "text-slate-muted"}
      />
      <PlanFieldLabel
        currentValue={currentValue}
        isExpanded={isExpanded}
        label={option.label}
      />
      <PlanFieldChevron isExpanded={isExpanded} />
    </button>
  );
}

function PlanFieldLabel({
  currentValue,
  isExpanded,
  label,
}: {
  currentValue: string;
  isExpanded: boolean;
  label: string;
}) {
  return (
    <span className="min-w-0 flex-1">
      <span
        className={[
          "block font-medium text-sm leading-snug transition-colors duration-150",
          isExpanded ? "text-forge-teal" : "text-ink",
        ].join(" ")}
      >
        {label}
      </span>
      {!isExpanded && currentValue ? (
        <span className="mt-0.5 block truncate text-slate-muted text-xs">
          {currentValue}
        </span>
      ) : null}
    </span>
  );
}

function PlanFieldChevron({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.span
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      aria-hidden="true"
      className="shrink-0"
    >
      <ChevronDown
        className={[
          "size-4 transition-colors duration-150",
          isExpanded ? "text-forge-teal" : "text-slate-muted/40",
        ].join(" ")}
        strokeWidth={1.75}
      />
    </motion.span>
  );
}

interface PlanFieldBodyProps {
  currentValue: string;
  form: PlanProposalForm;
  isExpanded: boolean;
  onLocationModeChange: (mode: string) => void;
  option: PlanProposalFieldOption;
}

function PlanFieldBody({
  currentValue,
  form,
  isExpanded,
  onLocationModeChange,
  option,
}: PlanFieldBodyProps) {
  return (
    <AnimatePresence initial={false}>
      {isExpanded ? (
        <motion.div
          id={`field-body-${option.value}`}
          role="region"
          aria-label={`Edit ${option.label}`}
          key={`body-${option.value}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {
              height: {
                duration: 0.28,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
              opacity: { duration: 0.2, delay: 0.07 },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: { duration: 0.2, ease: [0.4, 0, 1, 1] },
              opacity: { duration: 0.1 },
            },
          }}
          className="overflow-hidden"
        >
          <div className="px-5 pt-0 pb-5">
            <CurrentValueNote currentValue={currentValue} />
            <PlanFieldInput
              form={form}
              onLocationModeChange={onLocationModeChange}
              option={option}
            />
            <PlanFieldError error={form.error} />
            <PlanChangeActions form={form} />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CurrentValueNote({ currentValue }: { currentValue: string }) {
  if (!currentValue) {
    return null;
  }

  return (
    <p className="mb-3 flex items-baseline gap-1.5 text-slate-muted text-xs">
      <span className="shrink-0 font-medium">Currently:</span>
      <span className="min-w-0 truncate">{currentValue}</span>
    </p>
  );
}

function PlanFieldInput({
  form,
  onLocationModeChange,
  option,
}: {
  form: PlanProposalForm;
  onLocationModeChange: (mode: string) => void;
  option: PlanProposalFieldOption;
}) {
  function handleLocationSelect(location: PlanLocationSelection | null) {
    form.setLocationValue((current) =>
      getLocationValueFromSelection(current, location),
    );
  }

  function handleLinkChange(value: string) {
    form.setLocationValue((current) =>
      getLocationValueFromLink(current, value),
    );
  }

  if (form.isDateField) {
    return <DateTimeInput value={form.value} onValueChange={form.setValue} />;
  }

  if (form.isLocationField) {
    return (
      <LocationInput
        locationValue={form.locationValue}
        onModeChange={onLocationModeChange}
        onLocationSelect={handleLocationSelect}
        onLinkChange={handleLinkChange}
      />
    );
  }

  return (
    <Textarea
      value={form.value}
      onChange={(event) => form.setValue(event.target.value)}
      rows={option.value === "DESCRIPTION" ? 4 : 2}
      className="resize-none"
    />
  );
}

function PlanFieldError({ error }: { error: string | null }) {
  if (!error) {
    return null;
  }

  return (
    <Notice
      aria-live="polite"
      tone="danger"
      size="sm"
      icon={<AlertCircle className="size-3.5 shrink-0" />}
      className="mt-3 bg-destructive/8"
    >
      {error}
    </Notice>
  );
}

function PlanChangeActions({ form }: { form: PlanProposalForm }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      {!form.isOnline ? (
        <p role="status" className="mr-auto min-w-0 text-slate-muted text-xs">
          Reconnect before sending.
        </p>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={form.closeForm}
        className="text-slate-muted"
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={!form.isOnline}
        loading={form.isCreating}
        onClick={() => void form.handleSubmit()}
        title={
          form.isOnline
            ? undefined
            : "Reconnect before suggesting plan changes."
        }
      >
        <SendHorizontal className="size-3.5" aria-hidden="true" />
        Send to group
      </Button>
    </div>
  );
}

// ── Location sub-component ────────────────────────────────────────────────────

interface LocationInputProps {
  locationValue: {
    locationMode: string;
    location: string;
    locationLat: number | null;
    locationLng: number | null;
  };
  onModeChange: (mode: string) => void;
  onLocationSelect: (location: PlanLocationSelection | null) => void;
  onLinkChange: (value: string) => void;
}

function LocationInput({
  locationValue,
  onModeChange,
  onLocationSelect,
  onLinkChange,
}: LocationInputProps) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2 border-0 p-0">
      <Select value={locationValue.locationMode} onValueChange={onModeChange}>
        <SelectTrigger aria-label="Location type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LOCATION_MODE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {locationValue.locationMode === "IN_PERSON" ? (
        <AddressAutocomplete
          label="Place or address"
          badge="Plan location"
          hint="Members will see this place if the group approves the change."
          placeholder="Search address or venue name..."
          value={
            locationValue.location
              ? {
                  address: locationValue.location,
                  city: locationValue.location,
                  lat: locationValue.locationLat,
                  lng: locationValue.locationLng,
                }
              : null
          }
          onLocationSelect={onLocationSelect}
          className="[&_label]:font-semibold [&_label]:text-muted-foreground [&_label]:text-xs"
        />
      ) : locationValue.locationMode === "ONLINE" ? (
        <Input
          value={locationValue.location}
          onChange={(event) => onLinkChange(event.target.value)}
          placeholder="Meeting link or platform"
        />
      ) : null}
    </fieldset>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function isPlanLocationMode(value: string): value is Plan["locationMode"] {
  return Object.keys(LOCATION_MODE_LABELS).some((mode) => mode === value);
}
