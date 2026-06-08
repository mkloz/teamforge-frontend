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
    if (!plan) {
      setError("This group does not have a plan to change yet.");
      return;
    }

    let proposedValue = "";

    try {
      proposedValue = getProposedValue({
        costValue,
        field,
        locationValue,
        value,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Check the change and try again.",
      );
      return;
    }

    if (!proposedValue) {
      setError("Add a new value before sending a change.");
      return;
    }

    if (proposedValue === getCurrentSerializedProposalValue(plan, field)) {
      setError("Change at least one detail before sending.");
      return;
    }

    setError(null);

    try {
      await onCreate({ field, proposedValue });
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

function getProposedValue({
  costValue,
  field,
  locationValue,
  value,
}: {
  costValue: PlanCostValue | null;
  field: PlanProposalField;
  locationValue: PlanLocationValue | null;
  value: string;
}) {
  if (field === "LOCATION") {
    if (!locationValue) {
      throw new Error("Choose a location option first.");
    }

    return serializePlanLocationValue(locationValue);
  }

  if (field === "COST") {
    if (!costValue) {
      throw new Error("Choose a cost option first.");
    }

    return serializePlanCostValue(costValue);
  }

  return normalizeProposalValue(field, value);
}
