import { Monitor } from "lucide-react";

import {
  AddressAutocomplete,
  type LocationValue,
} from "@/shared/components/maps/address-autocomplete";
import { Input } from "@/shared/components/ui/input";

import { FieldLabel } from "./field-label";
import { PlanDecisionToggle } from "./plan-decision-toggle";
import type { ForgeScope, LocationType } from "./types";

const EMPTY_SELECTED_PLAN_LOCATION = {
  address: "",
  lat: null,
  lng: null,
};

interface LocationSectionProps {
  forgeScope: ForgeScope;
  locationType: LocationType;
  onLocationTypeChange: (value: LocationType) => void;
  onPlanLocationChange: (value: string) => void;
  onPlanLocationCoordinatesChange: (
    lat: number | null,
    lng: number | null,
  ) => void;
  planLocation: string;
  planLocationLat: number | null;
  planLocationLng: number | null;
}

interface LocationSectionRenderState {
  showAddress: boolean;
  showOnlineLocation: boolean;
  showTbdNotice: boolean;
}

export function LocationSection({
  forgeScope,
  locationType,
  onLocationTypeChange,
  onPlanLocationChange,
  onPlanLocationCoordinatesChange,
  planLocation,
  planLocationLat,
  planLocationLng,
}: LocationSectionProps) {
  const renderState = getLocationSectionRenderState(locationType);
  const isMeetingPointSet = locationType !== "TBD";

  function handleMeetingPointToggle(checked: boolean) {
    onLocationTypeChange(
      checked ? (forgeScope === "ONLINE" ? "ONLINE" : "IN_PERSON") : "TBD",
    );
  }

  return (
    <div className="flex flex-col">
      <PlanDecisionToggle
        checked={isMeetingPointSet}
        checkedDescription={
          forgeScope === "ONLINE"
            ? "Add the platform or meeting link below."
            : "Add the venue or address below."
        }
        label="Set meeting details now"
        onCheckedChange={handleMeetingPointToggle}
        uncheckedDescription="The group can decide after it forms."
      />

      <div className="pt-4">
        {renderState.showAddress && (
          <InPersonLocationInput
            onPlanLocationChange={onPlanLocationChange}
            onPlanLocationCoordinatesChange={onPlanLocationCoordinatesChange}
            planLocation={planLocation}
            planLocationLat={planLocationLat}
            planLocationLng={planLocationLng}
          />
        )}

        {renderState.showOnlineLocation && (
          <OnlineLocationInput
            onPlanLocationChange={onPlanLocationChange}
            planLocation={planLocation}
            showOnlineLocation={renderState.showOnlineLocation}
          />
        )}

        {renderState.showTbdNotice && <LocationTbdNotice />}
      </div>
    </div>
  );
}

function getLocationSectionRenderState(
  locationType: LocationType,
): LocationSectionRenderState {
  return {
    showAddress: locationType === "IN_PERSON",
    showOnlineLocation: locationType === "ONLINE",
    showTbdNotice: locationType === "TBD",
  };
}

function InPersonLocationInput({
  onPlanLocationChange,
  onPlanLocationCoordinatesChange,
  planLocation,
  planLocationLat,
  planLocationLng,
}: Pick<
  LocationSectionProps,
  | "onPlanLocationChange"
  | "onPlanLocationCoordinatesChange"
  | "planLocation"
  | "planLocationLat"
  | "planLocationLng"
>) {
  return (
    <div className="fade-in slide-in-from-top-1 flex animate-in flex-col gap-2 duration-200">
      <AddressAutocomplete
        label="Address or venue"
        badge="Plan location"
        hint="Members will see this after the group is formed."
        placeholder="Search address or venue name..."
        value={getPlanLocationValue({
          planLocation,
          planLocationLat,
          planLocationLng,
        })}
        onLocationSelect={(location) =>
          applySelectedPlanLocation(location, {
            onPlanLocationChange,
            onPlanLocationCoordinatesChange,
          })
        }
        className="[&_label]:font-semibold [&_label]:text-muted-foreground [&_label]:text-xs"
      />
    </div>
  );
}

function applySelectedPlanLocation(
  location: LocationValue | null,
  {
    onPlanLocationChange,
    onPlanLocationCoordinatesChange,
  }: Pick<
    LocationSectionProps,
    "onPlanLocationChange" | "onPlanLocationCoordinatesChange"
  >,
) {
  const selectedLocation = getSelectedPlanLocation(location);

  onPlanLocationChange(selectedLocation.address);
  onPlanLocationCoordinatesChange(selectedLocation.lat, selectedLocation.lng);
}

function getSelectedPlanLocation(location: LocationValue | null) {
  if (!location) {
    return EMPTY_SELECTED_PLAN_LOCATION;
  }

  return {
    address: location.address,
    lat: location.lat,
    lng: location.lng,
  };
}

function getPlanLocationValue({
  planLocation,
  planLocationLat,
  planLocationLng,
}: Pick<
  LocationSectionProps,
  "planLocation" | "planLocationLat" | "planLocationLng"
>): LocationValue | null {
  if (!planLocation) {
    return null;
  }

  return {
    address: planLocation,
    city: planLocation,
    lat: planLocationLat,
    lng: planLocationLng,
  };
}

function OnlineLocationInput({
  onPlanLocationChange,
  planLocation,
  showOnlineLocation,
}: Pick<LocationSectionProps, "onPlanLocationChange" | "planLocation"> & {
  showOnlineLocation: boolean;
}) {
  return (
    <div className="fade-in slide-in-from-top-1 flex animate-in flex-col gap-2 duration-200">
      <FieldLabel htmlFor="plan-online-location">
        Meeting link or platform
      </FieldLabel>
      <Input
        id="plan-online-location"
        value={showOnlineLocation ? planLocation : ""}
        onChange={(event) => onPlanLocationChange(event.target.value)}
        placeholder="https://meet.example.com/friday or Discord"
        leftIcon={<Monitor size={15} />}
        maxLength={200}
      />
    </div>
  );
}

function LocationTbdNotice() {
  return (
    <p className="fade-in animate-in text-muted-foreground text-xs leading-relaxed duration-200">
      No meeting point is locked yet.
    </p>
  );
}
