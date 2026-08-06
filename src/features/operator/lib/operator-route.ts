import { z } from "zod";
import {
  type EvidenceCompleteness,
  evidenceCompletenessSchema,
  type ModerationCaseStatus,
  type ModerationSeverity,
  type ModerationUncertainty,
  moderationCaseStatusSchema,
  moderationSeveritySchema,
  moderationUncertaintySchema,
  type OperatorCaseSlaState,
  type OperatorCaseSort,
  type OperatorQueue,
  operatorCaseSlaStateSchema,
  operatorCaseSortSchema,
  operatorQueueSchema,
} from "@/features/operator/schemas/operator.schemas";

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u);

export type OperatorListSearch = {
  page?: number;
  queue?: OperatorQueue;
  status?: ModerationCaseStatus;
  severity?: ModerationSeverity;
  sla?: OperatorCaseSlaState;
  evidenceCompleteness?: EvidenceCompleteness;
  uncertainty?: ModerationUncertainty;
  sort?: OperatorCaseSort;
  createdFrom?: string;
  createdTo?: string;
  dueFrom?: string;
  dueTo?: string;
};

export type OperatorModerationSearch = OperatorListSearch & {
  queue: OperatorQueue;
};

export type OperatorCaseReturnSearch = OperatorModerationSearch & {
  source?: "assigned" | "intake";
};

export type OperatorCaseListInput = Omit<OperatorListSearch, "page"> & {
  page: number;
  limit: number;
};

export function parseOperatorListSearch(
  search: Record<string, unknown>,
): OperatorListSearch {
  return {
    page: parsePage(search.page),
    queue: operatorQueueSchema.safeParse(search.queue).data,
    status: moderationCaseStatusSchema.safeParse(search.status).data,
    severity: moderationSeveritySchema.safeParse(search.severity).data,
    sla: operatorCaseSlaStateSchema.safeParse(search.sla).data,
    evidenceCompleteness: evidenceCompletenessSchema.safeParse(
      search.evidenceCompleteness,
    ).data,
    uncertainty: moderationUncertaintySchema.safeParse(search.uncertainty).data,
    sort: operatorCaseSortSchema.safeParse(search.sort).data,
    createdFrom: dateOnlySchema.safeParse(search.createdFrom).data,
    createdTo: dateOnlySchema.safeParse(search.createdTo).data,
    dueFrom: dateOnlySchema.safeParse(search.dueFrom).data,
    dueTo: dateOnlySchema.safeParse(search.dueTo).data,
  };
}

export function parseOperatorModerationSearch(
  search: Record<string, unknown>,
): OperatorModerationSearch {
  return {
    ...parseOperatorListSearch(search),
    queue: operatorQueueSchema.safeParse(search.queue).data ?? "CRITICAL_NOW",
  };
}

export function parseOperatorCaseReturnSearch(
  search: Record<string, unknown>,
): OperatorCaseReturnSearch {
  const source = z.enum(["assigned", "intake"]).safeParse(search.source).data;
  return { ...parseOperatorModerationSearch(search), source };
}

export function toOperatorListInput(
  search: OperatorListSearch,
  limit: number,
): OperatorCaseListInput {
  return {
    ...search,
    page: search.page ?? 1,
    limit,
    createdFrom: toUtcBoundary(search.createdFrom, "start"),
    createdTo: toUtcBoundary(search.createdTo, "end"),
    dueFrom: toUtcBoundary(search.dueFrom, "start"),
    dueTo: toUtcBoundary(search.dueTo, "end"),
  };
}

export function hasOperatorFilters(search: OperatorListSearch) {
  return Boolean(
    search.status ||
      search.severity ||
      search.sla ||
      search.evidenceCompleteness ||
      search.uncertainty ||
      search.createdFrom ||
      search.createdTo ||
      search.dueFrom ||
      search.dueTo,
  );
}

export function hasOperatorIntakeFilters(search: OperatorListSearch) {
  return Boolean(search.queue || hasOperatorFilters(search));
}

function parsePage(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return undefined;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : undefined;
}

function toUtcBoundary(value: string | undefined, boundary: "start" | "end") {
  if (!value) return undefined;
  return `${value}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`;
}
