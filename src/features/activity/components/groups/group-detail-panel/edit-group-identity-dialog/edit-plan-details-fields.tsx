import { LOCATION_MODE_LABELS } from "@/features/activity/lib/plan-location";
import { DateTimeInput } from "@/shared/components/ui/datetime-input";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import type {
  CostType,
  LocationMode,
  PlanCategory,
} from "@/shared/schemas/enums";
import { formatPanelToken } from "../lib/constants";
import type { GroupIdentityEditor } from "./edit-group-identity-dialog.types";

interface EditPlanDetailsFieldsProps {
  editor: GroupIdentityEditor;
}

const PLAN_CATEGORY_OPTIONS = [
  "TECH",
  "SPORTS",
  "ARTS",
  "SOCIAL",
  "OUTDOORS",
  "LEARNING",
  "MUSIC",
  "FOOD",
  "GAMING",
  "WELLNESS",
  "TRAVEL",
  "OTHER",
] as const satisfies readonly PlanCategory[];

const COST_OPTIONS = ["FREE", "PAID"] as const satisfies readonly CostType[];

export function EditPlanDetailsFields({ editor }: EditPlanDetailsFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label
            htmlFor="plan-title"
            className="font-semibold text-muted-foreground text-xs"
          >
            Plan title
          </Label>
          <Input
            id="plan-title"
            value={editor.planTitle}
            onChange={(event) => editor.setPlanTitle(event.target.value)}
            maxLength={120}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="plan-category"
            className="font-semibold text-muted-foreground text-xs"
          >
            Category
          </Label>
          <Select
            value={editor.planCategory}
            onValueChange={(value) => {
              if (isPlanCategory(value)) {
                editor.setPlanCategory(value);
              }
            }}
          >
            <SelectTrigger id="plan-category">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {PLAN_CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {formatPanelToken(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="plan-description"
          className="font-semibold text-muted-foreground text-xs"
        >
          Plan description
        </Label>
        <Textarea
          id="plan-description"
          value={editor.planDescription}
          onChange={(event) => editor.setPlanDescription(event.target.value)}
          maxLength={1000}
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label
            htmlFor="plan-date-time"
            className="font-semibold text-muted-foreground text-xs"
          >
            Date & time
          </Label>
          <DateTimeInput
            value={editor.planDateTime}
            onValueChange={editor.setPlanDateTime}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="plan-location-mode"
            className="font-semibold text-muted-foreground text-xs"
          >
            Location type
          </Label>
          <Select
            value={editor.planLocationMode}
            onValueChange={(value) => {
              if (!isLocationMode(value)) {
                return;
              }

              editor.setPlanLocationMode(value);

              if (value === "TBD") {
                editor.setPlanLocation("");
              }
            }}
          >
            <SelectTrigger id="plan-location-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LOCATION_MODE_LABELS).map(([mode, label]) => (
                <SelectItem key={mode} value={mode}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {editor.planLocationMode !== "TBD" ? (
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="plan-location"
              className="font-semibold text-muted-foreground text-xs"
            >
              Location
            </Label>
            <Input
              id="plan-location"
              value={editor.planLocation}
              placeholder={
                editor.planLocationMode === "ONLINE"
                  ? "Meeting link or platform"
                  : "Place or address"
              }
              onChange={(event) => editor.setPlanLocation(event.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="plan-cost"
            className="font-semibold text-muted-foreground text-xs"
          >
            Cost
          </Label>
          <Select
            value={editor.planCost}
            onValueChange={(value) => {
              if (isCostType(value)) {
                editor.setPlanCost(value);
              }
            }}
          >
            <SelectTrigger id="plan-cost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COST_OPTIONS.map((cost) => (
                <SelectItem key={cost} value={cost}>
                  {formatPanelToken(cost)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {editor.planCost === "PAID" ? (
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="plan-cost-amount"
              className="font-semibold text-muted-foreground text-xs"
            >
              Estimated cost
            </Label>
            <Input
              id="plan-cost-amount"
              type="number"
              min={0}
              value={editor.planCostAmount}
              onChange={(event) => editor.setPlanCostAmount(event.target.value)}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label
            htmlFor="plan-cost-details"
            className="font-semibold text-muted-foreground text-xs"
          >
            Cost detail
          </Label>
          <Textarea
            id="plan-cost-details"
            value={editor.planCostDetails}
            onChange={(event) => editor.setPlanCostDetails(event.target.value)}
            rows={2}
            className="resize-none"
            placeholder="Useful context for the group"
          />
        </div>
      </div>
    </div>
  );
}

function isPlanCategory(value: string): value is PlanCategory {
  return PLAN_CATEGORY_OPTIONS.some((category) => category === value);
}

function isCostType(value: string): value is CostType {
  return COST_OPTIONS.some((cost) => cost === value);
}

function isLocationMode(value: string): value is LocationMode {
  return Object.keys(LOCATION_MODE_LABELS).some((mode) => mode === value);
}
