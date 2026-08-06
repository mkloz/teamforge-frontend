import { useQuery } from "@tanstack/react-query";
import {
  useNavigate,
  useRouteContext,
  useSearch,
} from "@tanstack/react-router";
import { ChevronRight, FileClock, FilterX, ShieldOff } from "lucide-react";
import type { FormEvent } from "react";
import {
  operatorAuditEventQueryOptions,
  operatorAuditEventsQueryOptions,
} from "@/features/operator/api/operator-audit-queries";
import { OperatorLoading } from "@/features/operator/components/operator-states";
import {
  hasOperatorAuditFilters,
  type OperatorAuditSearch,
  parseOperatorAuditSearch,
  toOperatorAuditListInput,
} from "@/features/operator/lib/operator-audit-route";
import {
  OPERATOR_AUDIT_OUTCOMES,
  OPERATOR_AUDIT_SORTS,
  type OperatorAuditEvent,
} from "@/features/operator/schemas/operator-audit.schemas";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

const AUDIT_PAGE_SIZE = 25;

export function OperatorAuditPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });
  const search = useSearch({ from: "/admin/audit" });
  const navigate = useNavigate({ from: "/admin/audit" });
  const canView = adminSession.capabilities.viewAuditLog;
  const query = useQuery({
    ...operatorAuditEventsQueryOptions(
      toOperatorAuditListInput(search, AUDIT_PAGE_SIZE),
    ),
    enabled: canView,
  });
  if (!canView) return <AuditRestrictedState />;
  if (query.isLoading) return <OperatorLoading />;
  if (query.isError || !query.data) {
    return (
      <AuditErrorState
        title="Audit history could not be loaded"
        onRetry={() => void query.refetch()}
      />
    );
  }

  const closeDetail = () =>
    void navigate({ search: { ...search, eventId: undefined }, replace: true });

  return (
    <div className="mx-auto grid w-full max-w-7xl content-start gap-8 px-4 py-6 md:px-8 md:py-10">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-primary text-xs">Governance</p>
            <h1 className="mt-1 font-extrabold text-3xl text-ink">
              Audit history
            </h1>
          </div>
          <span className="rounded-full bg-muted px-3 py-1.5 font-medium text-slate-muted text-xs">
            {formatTimezone()}
          </span>
        </div>
        <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          Review who performed an administrative action, what it targeted, and
          whether it succeeded. Sensitive authentication and integrity-chain
          fields are never displayed.
        </p>
      </header>

      <AuditFilters
        key={JSON.stringify(search)}
        search={search}
        onApply={(next) => void navigate({ search: next })}
        onClear={() => void navigate({ search: { sort: search.sort } })}
      />

      <section className="grid min-w-0 gap-4" aria-labelledby="audit-results">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="audit-results" className="font-semibold text-ink text-lg">
              Recorded actions
            </h2>
            <p className="mt-1 text-slate-muted text-xs">
              Generated {formatAuditTime(query.data.generatedAt)}
            </p>
          </div>
          {search.cursor ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                void navigate({ search: { ...search, cursor: undefined } })
              }
            >
              Back to first page
            </Button>
          ) : null}
        </div>

        <p className="sr-only" aria-live="polite">
          {query.isFetching
            ? "Updating audit history"
            : "Audit history updated"}
        </p>

        {query.data.items.length ? (
          <AuditTable
            events={query.data.items}
            fetching={query.isFetching}
            onSelect={(eventId) =>
              void navigate({
                search: { ...search, eventId },
                replace: true,
              })
            }
          />
        ) : (
          <AuditEmptyState filtered={hasOperatorAuditFilters(search)} />
        )}

        {query.data.nextCursor ? (
          <Button
            type="button"
            variant="outline"
            className="justify-self-end"
            onClick={() =>
              void navigate({
                search: {
                  ...search,
                  cursor: query.data?.nextCursor ?? undefined,
                  eventId: undefined,
                },
              })
            }
          >
            More events
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </section>

      <AuditDetailSheet
        eventId={search.eventId}
        open={Boolean(search.eventId)}
        onClose={closeDetail}
      />
    </div>
  );
}

function AuditFilters({
  onApply,
  onClear,
  search,
}: {
  onApply: (search: OperatorAuditSearch) => void;
  onClear: () => void;
  search: OperatorAuditSearch;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    onApply(
      parseOperatorAuditSearch({
        ...values,
        cursor: undefined,
        eventId: undefined,
      }),
    );
  };

  return (
    <form
      aria-label="Audit history filters"
      className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-ink text-sm">Exact filters</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          <FilterX className="size-4" aria-hidden="true" />
          Clear
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AuditTextFilter
          label="Actor account ID"
          name="actorAccountId"
          defaultValue={search.actorAccountId}
        />
        <AuditTextFilter
          label="Event type"
          name="eventType"
          defaultValue={search.eventType}
        />
        <AuditSelectFilter
          label="Outcome"
          name="outcome"
          defaultValue={search.outcome}
          options={OPERATOR_AUDIT_OUTCOMES}
        />
        <AuditSelectFilter
          label="Order"
          name="sort"
          defaultValue={search.sort}
          options={OPERATOR_AUDIT_SORTS}
          includeAll={false}
        />
        <AuditTextFilter
          label="Target type"
          name="targetType"
          defaultValue={search.targetType}
        />
        <AuditTextFilter
          label="Target ID"
          name="targetId"
          defaultValue={search.targetId}
        />
        <AuditTextFilter
          label="Case ID"
          name="caseId"
          defaultValue={search.caseId}
        />
        <div className="grid grid-cols-2 gap-3">
          <AuditDateFilter
            label="From"
            name="from"
            defaultValue={search.from}
          />
          <AuditDateFilter label="To" name="to" defaultValue={search.to} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-slate-muted text-xs">
          Exact identifiers only. Date ranges use UTC and are limited to 90
          days.
        </p>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
      </div>
    </form>
  );
}

function AuditTextFilter({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string;
  label: string;
  name: string;
}) {
  const id = `audit-${name}`;
  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-xs">
        {label}
      </FieldLabel>
      <Input id={id} name={name} defaultValue={defaultValue} maxLength={128} />
    </Field>
  );
}

function AuditSelectFilter({
  defaultValue,
  includeAll = true,
  label,
  name,
  options,
}: {
  defaultValue?: string;
  includeAll?: boolean;
  label: string;
  name: string;
  options: readonly string[];
}) {
  const id = `audit-${name}`;
  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-xs">
        {label}
      </FieldLabel>
      <NativeSelect id={id} name={name} defaultValue={defaultValue}>
        {includeAll ? (
          <NativeSelectOption value="">All</NativeSelectOption>
        ) : null}
        {options.map((option) => (
          <NativeSelectOption key={option} value={option}>
            {humanizeCode(option)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}

function AuditDateFilter({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string;
  label: string;
  name: string;
}) {
  const id = `audit-${name}`;
  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-xs">
        {label}
      </FieldLabel>
      <Input id={id} name={name} type="date" defaultValue={defaultValue} />
    </Field>
  );
}

function AuditTable({
  events,
  fetching,
  onSelect,
}: {
  events: OperatorAuditEvent[];
  fetching: boolean;
  onSelect: (eventId: string) => void;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-card shadow-sm transition-opacity",
        fetching && "opacity-65",
      )}
    >
      <Table>
        <TableCaption className="sr-only">Operator audit events</TableCaption>
        <TableHeader className="hidden text-slate-muted text-xs lg:table-header-group">
          <TableRow>
            <TableHead className="px-5">Time</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Detail</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              className="grid grid-cols-2 gap-4 px-5 py-5 lg:table-row lg:px-0 lg:py-0"
            >
              <AuditCell
                label="Time"
                value={formatAuditTime(event.createdAt)}
                first
              />
              <AuditCell
                label="Actor"
                value={event.actor.reference ?? event.actor.displayName}
              />
              <AuditCell label="Action" value={humanizeCode(event.eventType)} />
              <AuditCell
                label="Target"
                value={
                  event.targetType
                    ? `${humanizeCode(event.targetType)} · ${event.targetId ?? "—"}`
                    : "—"
                }
              />
              <TableCell className="grid gap-1 whitespace-normal p-0 lg:table-cell lg:p-2">
                <span className="text-slate-muted text-xs lg:hidden">
                  Outcome
                </span>
                <span className={outcomeClass(event.outcome)}>
                  {humanizeCode(event.outcome)}
                </span>
              </TableCell>
              <AuditCell
                label="Reason"
                value={event.reasonCode ? humanizeCode(event.reasonCode) : "—"}
              />
              <TableCell className="col-span-2 p-0 lg:table-cell lg:p-2 lg:pr-5 lg:text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(event.id)}
                >
                  Details
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AuditCell({
  first = false,
  label,
  value,
}: {
  first?: boolean;
  label: string;
  value: string;
}) {
  return (
    <TableCell
      className={cn(
        "grid gap-1 whitespace-normal p-0 text-sm lg:table-cell lg:p-2",
        first && "col-span-2 lg:px-5",
      )}
    >
      <span className="text-slate-muted text-xs lg:hidden">{label}</span>
      <span className="wrap-break-word text-ink">{value}</span>
    </TableCell>
  );
}

function AuditDetailSheet({
  eventId,
  onClose,
  open,
}: {
  eventId?: string;
  onClose: () => void;
  open: boolean;
}) {
  const query = useQuery({
    ...operatorAuditEventQueryOptions(eventId ?? ""),
    enabled: open && Boolean(eventId),
  });
  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="pr-8 text-left">
          <SheetTitle>Audit event detail</SheetTitle>
          <SheetDescription>
            Redacted operational fields for {eventId ?? "the selected event"}.
          </SheetDescription>
        </SheetHeader>
        {query.isLoading ? (
          <div className="mt-6 grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-36" />
          </div>
        ) : query.isError || !query.data ? (
          <div
            className="mt-6 rounded-xl border border-danger/25 bg-danger/5 p-4"
            role="alert"
          >
            <p className="font-semibold text-danger text-sm">
              Event detail could not be loaded.
            </p>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6">
            <dl className="grid gap-4 rounded-xl bg-card p-4">
              <DetailTerm
                label="Time"
                value={formatAuditTime(query.data.createdAt)}
              />
              <DetailTerm
                label="Actor"
                value={`${query.data.actor.displayName}${query.data.actor.reference ? ` · ${query.data.actor.reference}` : ""}`}
              />
              <DetailTerm
                label="Action"
                value={humanizeCode(query.data.eventType)}
              />
              <DetailTerm
                label="Outcome"
                value={humanizeCode(query.data.outcome)}
              />
              <DetailTerm
                label="Target"
                value={
                  query.data.targetType
                    ? `${humanizeCode(query.data.targetType)} · ${query.data.targetId ?? "—"}`
                    : "—"
                }
              />
              <DetailTerm
                label="Case"
                value={query.data.caseReference ?? "—"}
              />
              <DetailTerm
                label="Reason"
                value={
                  query.data.reasonCode
                    ? humanizeCode(query.data.reasonCode)
                    : "—"
                }
              />
            </dl>
            <div>
              <h3 className="font-semibold text-ink text-sm">
                Operational metadata
              </h3>
              {Object.keys(query.data.metadata).length ? (
                <dl className="mt-3 grid gap-3 rounded-xl border border-border p-4">
                  {Object.entries(query.data.metadata).map(([key, value]) => (
                    <DetailTerm
                      key={key}
                      label={humanizeCode(key)}
                      value={formatMetadata(value)}
                    />
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-slate-muted text-sm">
                  No public operational metadata is attached.
                </p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="wrap-break-word text-ink text-sm">{value}</dd>
    </div>
  );
}

function AuditEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-2xl border border-border border-dashed p-8 text-center">
      <div className="grid max-w-md justify-items-center gap-2">
        <FileClock className="size-8 text-slate-muted" aria-hidden="true" />
        <h2 className="font-semibold text-ink">
          {filtered
            ? "No events match these filters"
            : "No audit events recorded"}
        </h2>
        <p className="text-pretty text-slate-muted text-sm">
          {filtered
            ? "Adjust the exact filters or date range."
            : "Administrative actions will appear here when they are recorded."}
        </p>
      </div>
    </div>
  );
}

function AuditRestrictedState() {
  return (
    <div className="mx-auto grid min-h-[60dvh] max-w-xl place-items-center px-4 text-center">
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-8">
        <ShieldOff className="mx-auto size-9" aria-hidden="true" />
        <h1 className="font-bold text-2xl text-ink">
          Audit history is restricted
        </h1>
        <p className="text-pretty text-slate-muted text-sm">
          This owner-only capability is not enabled for the current environment.
        </p>
      </div>
    </div>
  );
}

function AuditErrorState({
  onRetry,
  title,
}: {
  onRetry: () => void;
  title: string;
}) {
  return (
    <div className="mx-auto grid min-h-[60dvh] max-w-xl place-items-center px-4 text-center">
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-8">
        <h1 className="font-bold text-2xl text-ink">{title}</h1>
        <p className="text-slate-muted text-sm">
          The audit workspace remains closed until access and data can be
          verified.
        </p>
        <Button variant="outline" className="mx-auto" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function formatAuditTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    second: "2-digit",
    timeZoneName: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTimezone() {
  return `Times shown in ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
}

function humanizeCode(value: string) {
  return value
    .replace(/([a-z])([A-Z])/gu, "$1 $2")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/u, (letter) => letter.toUpperCase());
}

function outcomeClass(outcome: OperatorAuditEvent["outcome"]) {
  return cn(
    "font-semibold text-xs",
    outcome === "SUCCEEDED"
      ? "text-primary"
      : outcome === "FAILED" || outcome === "DENIED"
        ? "text-danger"
        : "text-accent",
  );
}

function formatMetadata(value: boolean | number | string | string[] | null) {
  if (value === null) return "—";
  if (Array.isArray(value)) return value.join(" · ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
