import { Globe, MapPin, Monitor } from "lucide-react";

import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { cn } from "@/shared/lib/utils";

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

  return (
    <SectionCard>
      <SectionHeader
        icon={<MapPin size={14} />}
        title="Location"
        description="Choose where the group will meet."
      />

      <div
        className="grid grid-cols-3 gap-2"
        role="radiogroup"
        aria-label="Location type"
      >
        {LOCATION_TYPES.map(({ id, label, sub, Icon }) => {
          const active = locationType === id;

          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onLocationTypeChange(id)}
              className={cn(
                "group flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-center transition duration-150 active:scale-[0.97]",
                active
                  ? "border-primary/30 bg-primary/8 ring-1 ring-primary/20 shadow-sm"
                  : "border-border/50 bg-background/40 hover:border-primary/20 hover:bg-primary/4",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                )}
              >
                <Icon size={15} />
              </div>
              <div>
                <p
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    active ? "text-primary" : "text-foreground",
                  )}
                >
                  {label}
                </p>
                <p className="text-micro text-muted-foreground/60 leading-tight mt-0.5">
                  {sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {showAddress && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <AddressAutocomplete
            label="Address or venue"
            badge="Plan location"
            hint="Venue coordinates help suggest nearby people. Members will see the plan location after the group is formed."
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
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 animate-in fade-in duration-200">
          <Monitor size={12} className="text-muted-foreground/50 shrink-0" />
          <p className="text-xs text-muted-foreground/70">
            A meeting link can be shared with members after the group is forged.
          </p>
        </div>
      )}

      {locationType === "TBD" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 animate-in fade-in duration-200">
          <Globe size={12} className="text-muted-foreground/50 shrink-0" />
          <p className="text-xs text-muted-foreground/70">
            Location will be confirmed with members once the group is formed.
          </p>
        </div>
      )}
    </SectionCard>
  );
}
