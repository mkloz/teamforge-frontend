import { z } from "zod";
import {
  type OperatorAuditOutcome,
  type OperatorAuditSort,
  operatorAuditOutcomeSchema,
  operatorAuditSortSchema,
} from "@/features/operator/schemas/operator-audit.schemas";

const exactValueSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9:_-]+$/u);
const cursorSchema = z
  .string()
  .min(1)
  .max(1024)
  .regex(/^[A-Za-z0-9_-]+$/u);
const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u);

export type OperatorAuditSearch = {
  actorAccountId?: string;
  caseId?: string;
  cursor?: string;
  eventId?: string;
  eventType?: string;
  from?: string;
  outcome?: OperatorAuditOutcome;
  sort: OperatorAuditSort;
  targetId?: string;
  targetType?: string;
  to?: string;
};

export type OperatorAuditListInput = Omit<OperatorAuditSearch, "eventId"> & {
  limit: number;
};

export function parseOperatorAuditSearch(
  search: Record<string, unknown>,
): OperatorAuditSearch {
  return {
    actorAccountId: exactValueSchema.safeParse(search.actorAccountId).data,
    caseId: exactValueSchema.safeParse(search.caseId).data,
    cursor: cursorSchema.safeParse(search.cursor).data,
    eventId: exactValueSchema.safeParse(search.eventId).data,
    eventType: exactValueSchema.safeParse(search.eventType).data,
    from: dateOnlySchema.safeParse(search.from).data,
    outcome: operatorAuditOutcomeSchema.safeParse(search.outcome).data,
    sort: operatorAuditSortSchema.safeParse(search.sort).data ?? "NEWEST",
    targetId: exactValueSchema.safeParse(search.targetId).data,
    targetType: exactValueSchema.safeParse(search.targetType).data,
    to: dateOnlySchema.safeParse(search.to).data,
  };
}

export function toOperatorAuditListInput(
  search: OperatorAuditSearch,
  limit: number,
): OperatorAuditListInput {
  const { eventId: _eventId, ...listSearch } = search;
  return {
    ...listSearch,
    from: toUtcBoundary(search.from, "start"),
    limit,
    to: toUtcBoundary(search.to, "end"),
  };
}

export function hasOperatorAuditFilters(search: OperatorAuditSearch) {
  return Boolean(
    search.actorAccountId ||
      search.caseId ||
      search.eventType ||
      search.from ||
      search.outcome ||
      search.targetId ||
      search.targetType ||
      search.to,
  );
}

function toUtcBoundary(value: string | undefined, boundary: "start" | "end") {
  if (!value) return undefined;
  return `${value}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`;
}
