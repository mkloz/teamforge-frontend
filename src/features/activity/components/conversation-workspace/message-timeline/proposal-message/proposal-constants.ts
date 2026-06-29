import {
  CircleDollarSign,
  Clock3,
  FileText,
  type LucideIcon,
  MapPin,
  Shapes,
} from "lucide-react";
import { PROPOSAL_FIELD_LABELS } from "@/features/activity/lib/proposal-language";
import type { PlanProposalField } from "@/shared/schemas/enums";

export const FIELD_ICON_COMPONENTS: Record<PlanProposalField, LucideIcon> = {
  TITLE: FileText,
  DESCRIPTION: FileText,
  DATE_TIME: Clock3,
  LOCATION: MapPin,
  COST: CircleDollarSign,
  CATEGORY: Shapes,
};

export const FIELD_LABELS: Record<PlanProposalField, string> =
  PROPOSAL_FIELD_LABELS;
