import { Globe, MapPin, Monitor } from "lucide-react";

import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";

import { FieldLabel } from "./field-label";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import { LOCATION_TYPES } from "./step2-plan.constants";
import type { LocationType } from "./types";

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

export function LocationSection({
  locationType,
  onLocationTypeChange,
  onPlanLocationChange,
  onPlanLocationCoordinatesChange,
  planLocation,
  planLocationLat,
  planLocationLng,
}: LocationSectionProps) {
  const showAddress = locationType === "IN_PERSON";
  const showOnlineLocation = locationType === "ONLINE";
  const handleLocationTypeChange = (value: string) => {
    if (isLocationType(value)) {
      onLocationTypeChange(value);
    }
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={<MapPin size={14} />}
        title="Place"
        description="Add a venue, meeting link, or leave the place for later."
      />

      <RadioGroup
        value={locationType}
        onValueChange={handleLocationTypeChange}
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        aria-label="Location type"
      >
        {LOCATION_TYPES.map(({ id, label, sub, Icon }) => {
          const active = locationType === id;
          const itemId = `location-type-${id.toLowerCase()}`;

          return (
            <Label
              key={id}
              htmlFor={itemId}
              className={cn(
                "group flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left transition duration-150 active:scale-[0.98]",
                active
                  ? "border-forge-teal/35 bg-forge-teal/10 ring-1 ring-forge-teal/20"
                  : "border-border/50 bg-background/40 hover:border-forge-teal/25 hover:bg-forge-teal/5",
              )}
            >
              <RadioGroupItem id={itemId} value={id} className="sr-only" />
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
                  active
                    ? "bg-forge-teal text-white"
                    : "bg-muted/60 text-muted-foreground group-hover:bg-forge-teal/10 group-hover:text-forge-teal",
                )}
              >
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-xs leading-tight font-semibold",
                    active ? "text-forge-teal" : "text-foreground",
                  )}
                >
                  {label}
                </p>
                <p className="mt-0.5 truncate text-micro leading-tight text-muted-foreground/60">
                  {sub}
                </p>
              </div>
            </Label>
          );
        })}
      </RadioGroup>

      {showAddress && (
        <div className="animate-in space-y-2 duration-200 fade-in slide-in-from-top-1">
          <AddressAutocomplete
            label="Address or venue"
            badge="Plan location"
            hint="Members will see this after the group is formed."
            placeholder="Search address or venue name..."
            value={
              planLocation
                ? {
                    address: planLocation,
                    city: planLocation,
                    lat: planLocationLat,
                    lng: planLocationLng,
                  }
                : null
            }
            onLocationSelect={(location) => {
              onPlanLocationChange(location?.address ?? "");
              onPlanLocationCoordinatesChange(
                location?.lat ?? null,
                location?.lng ?? null,
              );
            }}
            className="[&_label]:text-xs [&_label]:font-semibold [&_label]:text-muted-foreground"
          />
        </div>
      )}

      {locationType === "ONLINE" && (
        <div className="animate-in space-y-2 duration-200 fade-in slide-in-from-top-1">
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
      )}

      {locationType === "TBD" && (
        <div className="flex animate-in items-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 duration-200 fade-in">
          <Globe size={12} className="shrink-0 text-muted-foreground/50" />
          <p className="text-xs leading-snug text-muted-foreground/70">
            Location will be confirmed with members once the group is formed.
          </p>
        </div>
      )}
    </SectionCard>
  );
}

function isLocationType(value: string): value is LocationType {
  return LOCATION_TYPES.some((locationType) => locationType.id === value);
}
