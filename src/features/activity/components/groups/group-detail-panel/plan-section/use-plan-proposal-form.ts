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
    let proposedValue: string;
    let currentComparableValue: string;

    try {
      proposedValue =
        field === "LOCATION"
          ? buildLocationProposalValue(locationValue)
          : normalizeProposedValue(field, value);
      currentComparableValue =
        field === "LOCATION"
          ? getCurrentSerializedLocationProposalValue(plan)
          : normalizeProposedValue(field, currentValue);
    } catch (proposalError) {
      setError(
        proposalError instanceof Error
          ? proposalError.message
          : "Check the proposal value and try again.",
      );
      return;
    }

    if (!proposedValue || proposedValue === currentComparableValue) {
      setError("Add a new value before sending a proposal.");
      return;
    }

    setError(null);
    createProposal({
      field,
      proposedValue,
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
