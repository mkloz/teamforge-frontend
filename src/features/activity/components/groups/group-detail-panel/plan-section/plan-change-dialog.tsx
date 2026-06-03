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
import { Input } from "@/shared/components/ui/input";
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

      <DialogContent className="max-h-[90svh] overflow-y-auto rounded-3xl bg-canvas p-0 sm:max-w-sm [&>button]:hidden">
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
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-slate-muted transition-colors hover:bg-black/8 hover:text-ink"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Accordion field list ──────────────────────────────── */}
        <ul aria-label="Plan fields" className="border-border/50 border-t">
          {PLAN_PROPOSAL_FIELD_OPTIONS.map((option, index) => {
            const Icon = FIELD_ICON[option.value];
            const isExpanded = form.field === option.value && form.isOpen;
            const isLast = index === PLAN_PROPOSAL_FIELD_OPTIONS.length - 1;
            const currentValue = getCurrentProposalValue(plan, option.value);

            return (
              <li
                key={option.value}
                className={[
                  "relative transition-colors duration-150",
                  !isLast && "border-border/50 border-b",
                  isExpanded && "bg-forge-teal/[0.03]",
                ].join(" ")}
              >
                {/* Teal left accent strip */}
                <div
                  aria-hidden="true"
                  className={[
                    "absolute top-0 bottom-0 left-0 w-[3px] rounded-r-full transition-all duration-300",
                    isExpanded ? "bg-forge-teal opacity-100" : "opacity-0",
                  ].join(" ")}
                />

                {/* Row trigger */}
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`field-body-${option.value}`}
                  onClick={() => {
                    if (isProposalField(option.value)) {
                      form.handleFieldChange(option.value);
                    }
                  }}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
                >
                  {/* Icon badge */}
                  <span
                    className={[
                      "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                      isExpanded
                        ? "bg-forge-teal/15 text-forge-teal"
                        : "text-slate-muted",
                    ].join(" ")}
                  >
                    <Icon className="size-3.75" strokeWidth={1.75} />
                  </span>

                  {/* Label + preview value */}
                  <span className="min-w-0 flex-1">
                    <span
                      className={[
                        "block font-medium text-sm leading-snug transition-colors duration-150",
                        isExpanded ? "text-forge-teal" : "text-ink",
                      ].join(" ")}
                    >
                      {option.label}
                    </span>
                    {!isExpanded && currentValue ? (
                      <span className="mt-0.5 block truncate text-slate-muted text-xs">
                        {currentValue}
                      </span>
                    ) : null}
                  </span>

                  {/* Animated chevron */}
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
                </button>

                {/* Expanded input body */}
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
                        {/* Current value annotation */}
                        {currentValue ? (
                          <p className="mb-3 flex items-baseline gap-1.5 text-slate-muted text-xs">
                            <span className="shrink-0 font-medium">
                              Currently:
                            </span>
                            <span className="min-w-0 truncate">
                              {currentValue}
                            </span>
                          </p>
                        ) : null}

                        {/* Field-specific input */}
                        {form.isDateField ? (
                          <DateTimeInput
                            value={form.value}
                            onValueChange={form.setValue}
                          />
                        ) : form.isLocationField ? (
                          <LocationInput
                            locationValue={form.locationValue}
                            onModeChange={handleLocationModeChange}
                            onLocationSelect={(location) =>
                              form.setLocationValue((current) => ({
                                ...current,
                                location: location?.address ?? "",
                                locationLat: location?.lat ?? null,
                                locationLng: location?.lng ?? null,
                              }))
                            }
                            onLinkChange={(value) =>
                              form.setLocationValue((current) => ({
                                ...current,
                                location: value,
                                locationLat: null,
                                locationLng: null,
                              }))
                            }
                          />
                        ) : (
                          <Textarea
                            value={form.value}
                            onChange={(event) =>
                              form.setValue(event.target.value)
                            }
                            rows={option.value === "DESCRIPTION" ? 4 : 2}
                            className="resize-none bg-card"
                          />
                        )}

                        {/* Validation error */}
                        {form.error ? (
                          <p
                            aria-live="polite"
                            className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2 font-medium text-destructive text-sm"
                          >
                            <AlertCircle className="mt-px size-3.5 shrink-0" />
                            <span>{form.error}</span>
                          </p>
                        ) : null}

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-end gap-2">
                          {!form.isOnline ? (
                            <p
                              role="status"
                              className="mr-auto min-w-0 text-slate-muted text-xs"
                            >
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
                            <SendHorizontal
                              className="size-3.5"
                              aria-hidden="true"
                            />
                            Send to group
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
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
  onLocationSelect: (
    location: {
      address: string;
      city: string;
      lat: number | null;
      lng: number | null;
    } | null,
  ) => void;
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
        <SelectTrigger aria-label="Location type" className="bg-card">
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
          className="bg-card"
        />
      ) : null}
    </fieldset>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function isPlanLocationMode(value: string): value is Plan["locationMode"] {
  return Object.keys(LOCATION_MODE_LABELS).some((mode) => mode === value);
}
