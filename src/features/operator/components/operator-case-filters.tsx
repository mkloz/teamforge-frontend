import { SlidersHorizontal, X } from "lucide-react";
import type { OperatorListSearch } from "@/features/operator/lib/operator-route";
import {
  evidenceCompletenessSchema,
  moderationCaseStatusSchema,
  moderationSeveritySchema,
  moderationUncertaintySchema,
  operatorCaseSlaStateSchema,
  operatorCaseSortSchema,
  operatorQueueSchema,
} from "@/features/operator/schemas/operator.schemas";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";

type OperatorCaseFiltersProps = {
  search: OperatorListSearch;
  onChange: (patch: Partial<OperatorListSearch>) => void;
  onClear: () => void;
  showQueue?: boolean;
};

export function OperatorCaseFilters({
  onChange,
  onClear,
  search,
  showQueue = false,
}: OperatorCaseFiltersProps) {
  return (
    <section
      aria-label="Case filters"
      className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="size-4 text-primary"
            aria-hidden="true"
          />
          <h2 className="font-semibold text-ink text-sm">Refine cases</h2>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          <X className="size-4" aria-hidden="true" />
          Clear filters
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {showQueue ? (
          <FilterSelect
            label="Queue"
            value={search.queue}
            options={operatorQueueSchema.options}
            onValue={(queue) =>
              onChange({ queue: operatorQueueSchema.safeParse(queue).data })
            }
          />
        ) : null}
        <FilterSelect
          label="Severity"
          value={search.severity}
          options={moderationSeveritySchema.options}
          onValue={(severity) =>
            onChange({
              severity: moderationSeveritySchema.safeParse(severity).data,
            })
          }
        />
        <FilterSelect
          label="Status"
          value={search.status}
          options={moderationCaseStatusSchema.options}
          onValue={(status) =>
            onChange({
              status: moderationCaseStatusSchema.safeParse(status).data,
            })
          }
        />
        <FilterSelect
          label="SLA"
          value={search.sla}
          options={operatorCaseSlaStateSchema.options}
          onValue={(sla) =>
            onChange({ sla: operatorCaseSlaStateSchema.safeParse(sla).data })
          }
        />
        <FilterSelect
          label="Evidence"
          value={search.evidenceCompleteness}
          options={evidenceCompletenessSchema.options}
          onValue={(evidenceCompleteness) =>
            onChange({
              evidenceCompleteness:
                evidenceCompletenessSchema.safeParse(evidenceCompleteness).data,
            })
          }
        />
        <FilterSelect
          label="Uncertainty"
          value={search.uncertainty}
          options={moderationUncertaintySchema.options}
          onValue={(uncertainty) =>
            onChange({
              uncertainty:
                moderationUncertaintySchema.safeParse(uncertainty).data,
            })
          }
        />
        <FilterSelect
          label="Order"
          emptyLabel="Default order"
          value={search.sort}
          options={operatorCaseSortSchema.options}
          onValue={(sort) =>
            onChange({ sort: operatorCaseSortSchema.safeParse(sort).data })
          }
        />
      </div>

      <details className="group">
        <summary className="w-fit cursor-pointer rounded-md font-medium text-primary text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Date range filters
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DateFilter
            label="Received from"
            value={search.createdFrom}
            onValue={(createdFrom) => onChange({ createdFrom })}
          />
          <DateFilter
            label="Received to"
            value={search.createdTo}
            onValue={(createdTo) => onChange({ createdTo })}
          />
          <DateFilter
            label="Due from"
            value={search.dueFrom}
            onValue={(dueFrom) => onChange({ dueFrom })}
          />
          <DateFilter
            label="Due to"
            value={search.dueTo}
            onValue={(dueTo) => onChange({ dueTo })}
          />
        </div>
        <p className="mt-3 text-slate-muted text-xs">
          Dates use UTC and a maximum span of 90 days.
        </p>
      </details>
    </section>
  );
}

function FilterSelect({
  emptyLabel = "All",
  label,
  onValue,
  options,
  value,
}: {
  emptyLabel?: string;
  label: string;
  onValue: (value: string) => void;
  options: readonly string[];
  value?: string;
}) {
  const id = `operator-filter-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-xs">
        {label}
      </FieldLabel>
      <NativeSelect
        id={id}
        size="sm"
        value={value ?? ""}
        onChange={(event) => onValue(event.currentTarget.value)}
      >
        <NativeSelectOption value="">{emptyLabel}</NativeSelectOption>
        {options.map((option) => (
          <NativeSelectOption key={option} value={option}>
            {humanizeOption(option)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}

function DateFilter({
  label,
  onValue,
  value,
}: {
  label: string;
  onValue: (value: string | undefined) => void;
  value?: string;
}) {
  const id = `operator-filter-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-xs">
        {label}
      </FieldLabel>
      <input
        id={id}
        type="date"
        value={value ?? ""}
        onChange={(event) => onValue(event.currentTarget.value || undefined)}
        className="h-9 rounded-lg border border-input-border bg-input px-3 text-ink text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
      />
    </Field>
  );
}

function humanizeOption(option: string) {
  return option
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/u, (letter) => letter.toUpperCase());
}
