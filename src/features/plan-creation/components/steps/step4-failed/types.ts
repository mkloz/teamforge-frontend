import type { GroupFormationMode } from "@/features/plan-creation/lib/plan-creation-contract";

export interface Step4FailedProps {
  groupFormationMode: GroupFormationMode;
  onSwitchToManual?: () => void;
}

export interface Step4FailedContent {
  title: string;
  description: string;
  context: string;
  reasons: readonly string[];
  suggestions: readonly string[];
}
