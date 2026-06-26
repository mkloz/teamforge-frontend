import { useState } from "react";
import type { CreateGroupPlanProposalPayload } from "@/features/group-plan-detail/api/group-plan-detail.api";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  getCurrentProposalValue,
  getCurrentSerializedProposalValue,
  getPlanCostValue,
  getPlanLocationValue,
  isPlanProposalField,
  normalizeProposalValue,
  type PlanCostValue,
  type PlanLocationValue,
  serializePlanCostValue,
  serializePlanLocationValue,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import type { PlanProposalField } from "@/shared/schemas/enums";

interface UsePlanChangeFormParams {
  detail: GroupPlanDetail;
  onCreate: (payload: CreateGroupPlanProposalPayload) => Promise<unknown>;
  onSubmitted: () => void;
}

type Plan = NonNullable<GroupPlanDetail["plan"]>;

interface ProposedValueInput {
  costValue: PlanCostValue | null;
  field: PlanProposalField;
  locationValue: PlanLocationValue | null;
  value: string;
}

interface PlanChangeSubmissionInput extends ProposedValueInput {
  plan: GroupPlanDetail["plan"];
}

type PlanChangeSubmission =
  | { kind: "error"; message: string }
  | { kind: "ready"; payload: CreateGroupPlanProposalPayload };

type ProposedValueResult =
  | { kind: "error"; message: string }
  | { kind: "ready"; proposedValue: string };

type ProposedValueResolver = (input: ProposedValueInput) => string;

const PROPOSED_VALUE_RESOLVERS: Partial<
  Record<PlanProposalField, ProposedValueResolver>
> = {
  COST: getCostProposedValue,
  LOCATION: getLocationProposedValue,
};

export function usePlanChangeForm({
  detail,
  onCreate,
  onSubmitted,
}: UsePlanChangeFormParams) {
  const plan = detail.plan;
  const [field, setField] = useState<PlanProposalField>("TITLE");
  const [value, setValue] = useState(() =>
    plan ? getCurrentProposalValue(plan, "TITLE") : "",
  );
  const [locationValue, setLocationValue] = useState<PlanLocationValue | null>(
    () => (plan ? getPlanLocationValue(plan) : null),
  );
  const [costValue, setCostValue] = useState<PlanCostValue | null>(() =>
    plan ? getPlanCostValue(plan) : null,
  );
  const [error, setError] = useState<string | null>(null);

  function resetForm(nextField: PlanProposalField = "TITLE") {
    setField(nextField);
    setValue(plan ? getCurrentProposalValue(plan, nextField) : "");
    setLocationValue(plan ? getPlanLocationValue(plan) : null);
    setCostValue(plan ? getPlanCostValue(plan) : null);
    setError(null);
  }

  function handleFieldChange(nextField: string) {
    if (!isPlanProposalField(nextField)) {
      return;
    }

    resetForm(nextField);
  }

  async function submit() {
    const submission = getPlanChangeSubmission({
      costValue,
      field,
      locationValue,
      plan,
      value,
    });

    if (submission.kind === "error") {
      setError(submission.message);
      return;
    }

    setError(null);

    try {
      await onCreate(submission.payload);
    } catch {
      return;
    }

    resetForm();
    onSubmitted();
  }

  return {
    costValue,
    currentValue: plan ? getCurrentProposalValue(plan, field) : "",
    error,
    field,
    handleFieldChange,
    locationValue,
    plan,
    resetForm,
    setCostValue,
    setLocationValue,
    setValue,
    submit,
    value,
  };
}

function getPlanChangeSubmission(
  input: PlanChangeSubmissionInput,
): PlanChangeSubmission {
  if (!input.plan) {
    return {
      kind: "error",
      message: "This group does not have a plan to change yet.",
    };
  }

  return getPlanChangeSubmissionForPlan(input.plan, input);
}

function getPlanChangeSubmissionForPlan(
  plan: Plan,
  input: ProposedValueInput,
): PlanChangeSubmission {
  const proposedValueResult = getProposedValueResult(input);

  if (proposedValueResult.kind === "error") {
    return proposedValueResult;
  }

  const { field } = input;
  const { proposedValue } = proposedValueResult;

  if (!proposedValue) {
    return {
      kind: "error",
      message: "Add a new value before sending a change.",
    };
  }

  if (proposedValue === getCurrentSerializedProposalValue(plan, field)) {
    return {
      kind: "error",
      message: "Change at least one detail before sending.",
    };
  }

  return {
    kind: "ready",
    payload: { field, proposedValue },
  };
}

function getProposedValueResult(
  input: ProposedValueInput,
): ProposedValueResult {
  try {
    return {
      kind: "ready",
      proposedValue: getProposedValue(input),
    };
  } catch (submitError) {
    return {
      kind: "error",
      message: getSubmitErrorMessage(submitError),
    };
  }
}

function getSubmitErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Check the change and try again.";
}

function getProposedValue(input: ProposedValueInput) {
  const resolver = PROPOSED_VALUE_RESOLVERS[input.field];

  return resolver
    ? resolver(input)
    : normalizeProposalValue(input.field, input.value);
}

function getLocationProposedValue({
  locationValue,
}: Pick<ProposedValueInput, "locationValue">) {
  if (!locationValue) {
    throw new Error("Choose a location option first.");
  }

  return serializePlanLocationValue(locationValue);
}

function getCostProposedValue({
  costValue,
}: Pick<ProposedValueInput, "costValue">) {
  if (!costValue) {
    throw new Error("Choose a cost option first.");
  }

  return serializePlanCostValue(costValue);
}
