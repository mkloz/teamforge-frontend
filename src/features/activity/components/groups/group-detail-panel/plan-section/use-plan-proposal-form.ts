import { useMemo, useState } from "react";

import { useCreatePlanProposal } from "@/features/activity/hooks/use-create-plan-proposal";
import type { Plan } from "@/features/activity/lib/activity-contract";

import {
  buildLocationProposalValue,
  getCurrentProposalValue,
  getCurrentSerializedLocationProposalValue,
  getLocationProposalInput,
  normalizeProposedValue,
  type ProposalField,
} from "./plan-proposal-fields";

function readProposalValues(
  field: ProposalField,
  plan: Plan,
  value: string,
  currentValue: string,
  locationValue: ReturnType<typeof getLocationProposalInput>,
) {
  if (field === "LOCATION") {
    return {
      currentComparableValue: getCurrentSerializedLocationProposalValue(plan),
      proposedValue: buildLocationProposalValue(locationValue),
    };
  }

  return {
    currentComparableValue: normalizeProposedValue(field, currentValue),
    proposedValue: normalizeProposedValue(field, value),
  };
}

export function usePlanProposalForm(plan: Plan) {
  const [isOpen, setIsOpen] = useState(false);
  const [field, setField] = useState<ProposalField>("TITLE");
  const [value, setValue] = useState(plan.title);
  const [locationValue, setLocationValue] = useState(() =>
    getLocationProposalInput(plan),
  );
  const { createProposal, error, isCreating, setError } = useCreatePlanProposal(
    plan,
    {
      onCreated: () => {
        setIsOpen(false);
        setField("TITLE");
        setValue(plan.title);
        setLocationValue(getLocationProposalInput(plan));
      },
    },
  );

  const currentValue = useMemo(
    () => getCurrentProposalValue(plan, field),
    [field, plan],
  );

  const handleFieldChange = (nextField: ProposalField) => {
    setField(nextField);
    setValue(getCurrentProposalValue(plan, nextField));
    setLocationValue(getLocationProposalInput(plan));
    setError(null);
  };

  const closeForm = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleSubmit = async () => {
    let proposalValues: ReturnType<typeof readProposalValues>;

    try {
      proposalValues = readProposalValues(
        field,
        plan,
        value,
        currentValue,
        locationValue,
      );
    } catch (proposalError) {
      setError(
        proposalError instanceof Error
          ? proposalError.message
          : "Check the proposal value and try again.",
      );
      return;
    }

    if (
      !proposalValues.proposedValue ||
      proposalValues.proposedValue === proposalValues.currentComparableValue
    ) {
      setError("Add a new value before sending a proposal.");
      return;
    }

    setError(null);
    await createProposal({
      field,
      proposedValue: proposalValues.proposedValue,
    });
  };

  return {
    closeForm,
    currentValue,
    error,
    field,
    handleFieldChange,
    handleSubmit,
    isCreating,
    isDateField: field === "DATE_TIME",
    isLocationField: field === "LOCATION",
    isOpen,
    locationValue,
    openForm: () => setIsOpen(true),
    setLocationValue,
    setValue,
    value,
  };
}
