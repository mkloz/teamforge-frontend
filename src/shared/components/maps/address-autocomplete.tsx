import { Loader2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { config } from "@/config/config";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface LocationValue {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  placeId?: string | null;
}

interface AddressAutocompleteProps {
  value: LocationValue | null;
  onLocationSelect: (value: LocationValue | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  badge?: string;
  hint?: string;
  className?: string;
}

type GoogleMapsStatus = "idle" | "loading" | "ready" | "unavailable";

function loadGoogleMaps() {
  const apiKey = config.googleMapsApiKey;

  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (window.__teamforgeGoogleMapsPromise) {
    return window.__teamforgeGoogleMapsPromise;
  }

  window.__teamforgeGoogleMapsPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-teamforge-google-maps="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.teamforgeGoogleMaps = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Google Maps failed to load.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return window.__teamforgeGoogleMapsPromise;
}

function getCityFromComponents(components: GoogleAddressComponent[] = []) {
  const preferredTypes = [
    "locality",
    "postal_town",
    "administrative_area_level_2",
    "administrative_area_level_1",
  ];

  for (const type of preferredTypes) {
    const match = components.find((component) =>
      component.types.includes(type),
    );

    if (match) {
      return match.long_name;
    }
  }

  return "";
}

function locationFromPlace(
  place: GooglePlaceResult,
  fallbackAddress: string,
  placeId?: string,
): LocationValue {
  const address = place.formatted_address ?? place.name ?? fallbackAddress;
  const city =
    getCityFromComponents(place.address_components) ??
    address.split(",")[0]?.trim() ??
    address;
  const location = place.geometry?.location;

  return {
    address,
    city: city || address,
    lat: location?.lat() ?? null,
    lng: location?.lng() ?? null,
    placeId: placeId ?? null,
  };
}

export function AddressAutocomplete({
  value,
  onLocationSelect,
  label = "Location",
  placeholder = "Search address, area, or venue...",
  disabled,
  required,
  badge = "City stays public",
  hint = "Exact point is used for matching only. Other members see your city.",
  className,
}: AddressAutocompleteProps) {
  const inputId = useId();
  const suggestionsId = `${inputId}-suggestions`;
  const externalInputValue = value?.address ?? "";
  const [draftInput, setDraftInput] = useState<{
    baseValue: string;
    value: string;
  } | null>(null);
  const [mapsStatus, setMapsStatus] = useState<GoogleMapsStatus>(
    config.googleMapsApiKey ? "loading" : "unavailable",
  );
  const [suggestions, setSuggestions] = useState<
    GoogleAutocompletePrediction[]
  >([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const inputValue =
    draftInput && draftInput.baseValue === externalInputValue
      ? draftInput.value
      : externalInputValue;
  const mapsReady = mapsStatus === "ready" && Boolean(window.google?.maps);
  const showManualHint = mapsStatus === "unavailable";
  const visibleSuggestions =
    mapsReady && inputValue.trim().length >= 3 ? suggestions : [];

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (!cancelled) {
          setMapsStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMapsStatus("unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!mapsReady || inputValue.trim().length < 3) {
      return;
    }

    let active = true;
    const handle = window.setTimeout(() => {
      const service = new window.google!.maps.places.AutocompleteService();

      service.getPlacePredictions(
        {
          input: inputValue.trim(),
          types: ["geocode", "establishment"],
        },
        (predictions, status) => {
          if (!active) {
            return;
          }

          if (status !== window.google!.maps.places.PlacesServiceStatus.OK) {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            return;
          }

          setSuggestions(predictions ?? []);
          setIsSuggestionsOpen(Boolean(predictions?.length));
        },
      );
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [inputValue, mapsReady]);

  const isBusy = mapsStatus === "loading" || isResolvingPlace || isLocating;
  const describedBy = useMemo(
    () => (message || showManualHint ? `${inputId}-hint` : undefined),
    [inputId, message, showManualHint],
  );

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    setDraftInput({ baseValue: externalInputValue, value: nextValue });
    setMessage(null);
    if (nextValue.trim().length < 3) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
    onLocationSelect({
      address: nextValue,
      city: nextValue,
      lat: null,
      lng: null,
      placeId: null,
    });
  }

  function clearLocation() {
    setDraftInput(null);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setMessage(null);
    onLocationSelect(null);
  }

  function selectPrediction(prediction: GoogleAutocompletePrediction) {
    if (!window.google?.maps) {
      return;
    }

    setIsResolvingPlace(true);
    setMessage(null);
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div"),
    );

    service.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["formatted_address", "geometry", "address_components", "name"],
      },
      (place, status) => {
        setIsResolvingPlace(false);
        setIsSuggestionsOpen(false);

        if (
          status !== window.google!.maps.places.PlacesServiceStatus.OK ||
          !place
        ) {
          setMessage("We couldn't read that location. Try another result.");
          return;
        }

        const nextLocation = locationFromPlace(
          place,
          prediction.description,
          prediction.place_id,
        );

        setDraftInput({
          baseValue: externalInputValue,
          value: nextLocation.address,
        });
        setSuggestions([]);
        onLocationSelect(nextLocation);
      },
    );
  }

  function useCurrentArea() {
    if (!navigator.geolocation || !window.google?.maps) {
      setMessage("Location access is unavailable in this browser.");
      return;
    }

    setIsLocating(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const geocoder = new window.google!.maps.Geocoder();

        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          setIsLocating(false);

          if (
            status !== window.google!.maps.GeocoderStatus.OK ||
            !results?.[0]
          ) {
            setMessage("We found your area, but couldn't label it.");
            onLocationSelect({
              address: "Current area",
              city: "Current area",
              lat,
              lng,
              placeId: null,
            });
            return;
          }

          const nextLocation = locationFromPlace(results[0], "Current area");

          onLocationSelect({
            ...nextLocation,
            lat,
            lng,
          });
          setDraftInput(null);
        });
      },
      () => {
        setIsLocating(false);
        setMessage("Allow location access or search manually.");
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 10_000,
      },
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-2", className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </label>
        <span className="rounded-full border border-slate-muted/30 bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink">
          {badge}
        </span>
      </div>

      <div className="relative">
        <Search
          size={17}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted"
        />
        <input
          id={inputId}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() =>
            setIsSuggestionsOpen(Boolean(visibleSuggestions.length))
          }
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsSuggestionsOpen(false);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isSuggestionsOpen}
          aria-controls={suggestionsId}
          aria-describedby={describedBy}
          className="h-11 w-full rounded-xl border border-slate-muted/35 bg-canvas pl-10 pr-20 text-sm font-medium text-ink outline-none transition-colors placeholder:text-slate-muted focus:border-forge-teal focus:ring-2 focus:ring-forge-teal/25 disabled:cursor-not-allowed disabled:bg-canvas/70 disabled:text-slate-muted"
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {isBusy ? (
            <Loader2
              size={15}
              className="animate-spin text-slate-muted"
              aria-hidden="true"
            />
          ) : null}
          {inputValue ? (
            <button
              type="button"
              onClick={clearLocation}
              disabled={disabled}
              className="inline-flex size-7 items-center justify-center rounded-full text-slate-muted transition-colors hover:bg-forge-teal/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30 disabled:pointer-events-none"
              aria-label="Clear location"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {isSuggestionsOpen && visibleSuggestions.length > 0 ? (
          <div
            id={suggestionsId}
            role="listbox"
            className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-muted/30 bg-canvas p-1 shadow-lg shadow-black/10"
          >
            {visibleSuggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                role="option"
                onClick={() => selectPrediction(suggestion)}
                className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-forge-teal/10 focus-visible:bg-forge-teal/10 focus-visible:outline-none"
              >
                <MapPin
                  size={16}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-forge-teal"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {suggestion.structured_formatting?.main_text ??
                      suggestion.description}
                  </span>
                  {suggestion.structured_formatting?.secondary_text ? (
                    <span className="block truncate text-xs font-medium text-slate-muted">
                      {suggestion.structured_formatting.secondary_text}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p
          id={`${inputId}-hint`}
          className="text-xs leading-5 text-slate-muted"
        >
          {message ??
            (showManualHint
              ? "Autocomplete is off. Type your city or venue manually."
              : hint)}
        </p>
        {mapsReady ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={useCurrentArea}
            disabled={disabled || isLocating}
            className="h-8 shrink-0 gap-2 px-2 font-semibold text-forge-teal"
          >
            <LocateFixed size={14} />
            Use my area
          </Button>
        ) : null}
      </div>
    </div>
  );
}
