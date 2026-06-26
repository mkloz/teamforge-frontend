import { Globe, Monitor } from "lucide-react";

import {
  AddressAutocomplete,
  type LocationValue,
} from "@/shared/components/maps/address-autocomplete";
import { Input } from "@/shared/components/ui/input";
import { SegmentedTabs } from "@/shared/components/ui/segmented-tabs";

import { FieldLabel } from "./field-label";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import { LOCATION_TYPES } from "./step2-plan.constants";
import type { LocationType } from "./types";

const EMPTY_SELECTED_PLAN_LOCATION = {
  address: "",
  lat: null,
  lng: null,
};

interface LocationSectionProps {
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

const LOCATION_TYPE_TABS = LOCATION_TYPES.map(({ id, label, Icon }) => ({
  icon: Icon,
  id,
  label,
}));

interface LocationSectionRenderState {
  showAddress: boolean;
  showOnlineLocation: boolean;
  showTbdNotice: boolean;
}

export function LocationSection({
  locationType,
  onLocationTypeChange,
  onPlanLocationChange,
  onPlanLocationCoordinatesChange,
  planLocation,
  planLocationLat,
  planLocationLng,
}: LocationSectionProps) {
  const renderState = getLocationSectionRenderState(locationType);

  return (
    <SectionCard>
      <SectionHeader title="Where" />

      <SegmentedTabs
        ariaLabel="Location type"
        fill
        options={LOCATION_TYPE_TABS}
        value={locationType}
        onChange={onLocationTypeChange}
      />

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
    </SectionCard>
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
    <div className="fade-in flex animate-in items-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 duration-200">
      <Globe size={12} className="shrink-0 text-muted-foreground/50" />
      <p className="text-muted-foreground/70 text-xs leading-snug">
        Your group can lock in the location once everyone's in.
      </p>
    </div>
  );
}
