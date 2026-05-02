import { useMemo, useState } from "react";

import { useCreatePlanProposal } from "@/features/activity/hooks/use-create-plan-proposal";
import type { Plan } from "@/features/activity/lib/activity-contract";

import {
  getCurrentProposalValue,
  normalizeProposedValue,
  type ProposalField,
} from "./plan-proposal-fields";

export function usePlanProposalForm(plan: Plan) {
  const [isOpen, setIsOpen] = useState(false);
  const [field, setField] = useState<ProposalField>("TITLE");
  const [value, setValue] = useState(plan.title);
  const { createProposal, error, isCreating, setError } = useCreatePlanProposal(
    plan,
    {
      onCreated: () => {
        setIsOpen(false);
        setField("TITLE");
        setValue(plan.title);
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
    setError(null);
  };

  const closeForm = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleSubmit = async () => {
    const proposedValue = normalizeProposedValue(field, value);

    if (
      !proposedValue ||
      proposedValue === normalizeProposedValue(field, currentValue)
    ) {
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
    isOpen,
    openForm: () => setIsOpen(true),
    setValue,
    value,
  };
}
