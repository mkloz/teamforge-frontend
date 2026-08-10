import {
  CalendarClock,
  CircleDollarSign,
  Image,
  MapPin,
  NotebookPen,
} from "lucide-react";
import type { ReactNode } from "react";
import { LOCATION_MODE_LABELS } from "@/features/activity/lib/plan-location";
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { Accordion } from "@/shared/components/ui/accordion";
import { DateTimeInput } from "@/shared/components/ui/datetime-input";
import { FormSectionAccordionItem } from "@/shared/components/ui/form-section-accordion";
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
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import {
  getBrowserTimeZone,
  getSupportedTimeZones,
  isValidTimeZone,
  resolveLocalPlanScheduleCandidates,
} from "@/shared/lib/plan-schedule";
import type {
  CostType,
  LocationMode,
  PlanCategory,
} from "@/shared/schemas/enums";
import { formatPanelToken } from "../lib/constants";
import type { GroupIdentityEditor } from "./edit-group-identity-dialog.types";

interface EditPlanDetailsFieldsProps {
  coverSection?: ReactNode;
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
const PLAN_TIME_ZONE_OPTIONS = getSupportedTimeZones();

interface PlanLocationSelection {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
}

function getEditorLocationAutocompleteValue(editor: GroupIdentityEditor) {
  if (!editor.planLocation) {
    return null;
  }

  return {
    address: editor.planLocation,
    city: editor.planLocation,
    lat: editor.planLocationLat,
    lng: editor.planLocationLng,
  };
}

function handleEditorLocationModeChange(
  editor: GroupIdentityEditor,
  value: string,
) {
  if (!isLocationMode(value)) {
    return;
  }

  editor.setPlanLocationMode(value);
  clearEditorLocationCoordinates(editor);

  if (value === "TBD") {
    editor.setPlanLocation("");
  }
}

function handleEditorLocationSelection(
  editor: GroupIdentityEditor,
  location: PlanLocationSelection | null,
) {
  if (!location) {
    editor.setPlanLocation("");
    clearEditorLocationCoordinates(editor);
    return;
  }

  editor.setPlanLocation(location.address);
  editor.setPlanLocationLat(location.lat);
  editor.setPlanLocationLng(location.lng);
}

function handleEditorLocationTextChange(
  editor: GroupIdentityEditor,
  value: string,
) {
  editor.setPlanLocation(value);
  clearEditorLocationCoordinates(editor);
}

function clearEditorLocationCoordinates(editor: GroupIdentityEditor) {
  editor.setPlanLocationLat(null);
  editor.setPlanLocationLng(null);
}

export function EditPlanDetailsFields({
  coverSection,
  editor,
}: EditPlanDetailsFieldsProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="basics"
      className="flex flex-col gap-2"
    >
      <FormSectionAccordionItem
        value="basics"
        title="Activity"
        summary={getPlanBasicsSummary(editor)}
        icon={NotebookPen}
      >
        <PlanBasicsFields editor={editor} />
      </FormSectionAccordionItem>

      <FormSectionAccordionItem
        value="schedule"
        title="Date and time"
        summary={formatPlanDateTime(editor.planDateTime)}
        icon={CalendarClock}
      >
        <PlanScheduleFields editor={editor} />
      </FormSectionAccordionItem>

      <FormSectionAccordionItem
        value="place"
        title="Place"
        summary={getPlanLocationSummary(editor)}
        icon={MapPin}
      >
        <PlanLocationFields editor={editor} />
      </FormSectionAccordionItem>

      <FormSectionAccordionItem
        value="cost"
        title="Cost"
        summary={getPlanCostSummary(editor)}
        icon={CircleDollarSign}
      >
        <PlanCostFields editor={editor} />
      </FormSectionAccordionItem>

      {coverSection ? (
        <FormSectionAccordionItem
          value="cover"
          title="Cover"
          summary={getPlanCoverSummary(editor)}
          icon={Image}
        >
          {coverSection}
        </FormSectionAccordionItem>
      ) : null}
    </Accordion>
  );
}

function PlanBasicsFields({ editor }: EditPlanDetailsFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="flex flex-col gap-2 sm:col-span-2">
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

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label
          htmlFor="plan-description"
          className="font-semibold text-muted-foreground text-xs"
        >
          Description
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
    </div>
  );
}

function PlanScheduleFields({ editor }: EditPlanDetailsFieldsProps) {
  const candidates =
    editor.planDateTime && isValidTimeZone(editor.planTimeZoneId)
      ? resolveLocalPlanScheduleCandidates(
          editor.planDateTime,
          editor.planTimeZoneId,
        )
      : [];
  const hasCanonicalSchedule = Boolean(editor.planTimeZoneId);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label
          htmlFor="plan-date-time"
          className="font-semibold text-muted-foreground text-xs"
        >
          Date and time
        </Label>
        <DateTimeInput
          value={editor.planDateTime}
          onValueChange={editor.setPlanDateTime}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="plan-time-zone"
          className="font-semibold text-muted-foreground text-xs"
        >
          Event time zone
        </Label>
        <Input
          id="plan-time-zone"
          list="plan-time-zone-options"
          value={editor.planTimeZoneId}
          placeholder={getBrowserTimeZone()}
          onChange={(event) => editor.setPlanTimeZoneId(event.target.value)}
        />
        <datalist id="plan-time-zone-options">
          {PLAN_TIME_ZONE_OPTIONS.map((timeZone) => (
            <option key={timeZone} value={timeZone}>
              {timeZone}
            </option>
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="plan-duration"
          className="font-semibold text-muted-foreground text-xs"
        >
          Duration in minutes
        </Label>
        <Input
          id="plan-duration"
          inputMode="numeric"
          min={1}
          max={1440}
          type="number"
          value={editor.planDurationMinutes}
          onChange={(event) =>
            editor.setPlanDurationMinutes(event.target.value)
          }
        />
      </div>

      {candidates.length > 1 ? (
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label
            htmlFor="plan-schedule-fold"
            className="font-semibold text-muted-foreground text-xs"
          >
            Repeated local time
          </Label>
          <Select
            value={String(editor.planScheduleFold)}
            onValueChange={(value) => editor.setPlanScheduleFold(Number(value))}
          >
            <SelectTrigger id="plan-schedule-fold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">First occurrence</SelectItem>
              <SelectItem value="1">Second occurrence</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Clocks change during this repeated hour. Choose which occurrence the
            plan uses.
          </p>
        </div>
      ) : null}

      {hasCanonicalSchedule &&
      editor.planDateTime &&
      candidates.length === 0 ? (
        <p className="text-destructive text-xs sm:col-span-2" role="alert">
          That local time does not exist in this time zone, or the time zone is
          invalid. Choose another time.
        </p>
      ) : null}

      <p className="text-muted-foreground text-xs sm:col-span-2">
        The event time zone keeps the plan stable across clock changes. A
        duration enables calendar export and Findafew-only conflict warnings.
      </p>
    </div>
  );
}

function PlanLocationFields({ editor }: EditPlanDetailsFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="plan-location-mode"
          className="font-semibold text-muted-foreground text-xs"
        >
          Location type
        </Label>
        <Select
          value={editor.planLocationMode}
          onValueChange={(value) =>
            handleEditorLocationModeChange(editor, value)
          }
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

      {editor.planLocationMode === "IN_PERSON" ? (
        <AddressAutocomplete
          label="Location"
          badge="Plan location"
          hint="Members will see this place on the plan."
          placeholder="Search address or venue name..."
          value={getEditorLocationAutocompleteValue(editor)}
          onLocationSelect={(location) =>
            handleEditorLocationSelection(editor, location)
          }
          className="[&_label]:font-semibold [&_label]:text-muted-foreground [&_label]:text-xs"
        />
      ) : editor.planLocationMode === "ONLINE" ? (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="plan-location"
            className="font-semibold text-muted-foreground text-xs"
          >
            Meeting link or platform
          </Label>
          <Input
            id="plan-location"
            value={editor.planLocation}
            placeholder="Add a link or platform"
            onChange={(event) =>
              handleEditorLocationTextChange(editor, event.target.value)
            }
          />
        </div>
      ) : (
        <p className="rounded-lg bg-black/[0.035] px-3 py-2.5 text-muted-foreground text-sm dark:bg-white/[0.035]">
          The group will choose the exact place together.
        </p>
      )}
    </div>
  );
}

function PlanCostFields({ editor }: EditPlanDetailsFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
          Cost note
        </Label>
        <Textarea
          id="plan-cost-details"
          value={editor.planCostDetails}
          onChange={(event) => editor.setPlanCostDetails(event.target.value)}
          rows={2}
          className="resize-none"
          placeholder="Optional context for the group"
        />
      </div>
    </div>
  );
}

function getPlanBasicsSummary(editor: GroupIdentityEditor) {
  const title = editor.planTitle.trim() || "Untitled plan";
  const category = editor.planCategory
    ? formatPanelToken(editor.planCategory)
    : null;

  return category ? `${title} · ${category}` : title;
}

function formatPlanDateTime(value: string) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getPlanLocationSummary(editor: GroupIdentityEditor) {
  const mode = LOCATION_MODE_LABELS[editor.planLocationMode];

  if (editor.planLocationMode === "TBD") {
    return "Decide with the group";
  }

  return editor.planLocation.trim()
    ? `${mode} · ${editor.planLocation.trim()}`
    : mode;
}

function getPlanCostSummary(editor: GroupIdentityEditor) {
  if (editor.planCost === "FREE") {
    return "Free";
  }

  return editor.planCostAmount
    ? `Paid · ${editor.planCostAmount}`
    : "Paid · amount not set";
}

function getPlanCoverSummary(editor: GroupIdentityEditor) {
  if (!editor.coverImage) {
    return "No cover";
  }

  return getPlanCoverPreset(editor.coverImage)?.label ?? "Custom image";
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
