import {
  Banknote,
  CalendarClock,
  Clock3,
  ExternalLink,
  MapPin,
  Radio,
  Wifi,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { LocationMode } from "@/shared/schemas/enums";

interface PlanVisualOverviewProps {
  cost: string;
  costSupporting?: string;
  dateTime: string;
  dateTimeIso: string | null;
  dateTimeSupporting?: string;
  isLocationResolved: boolean;
  isScheduleResolved: boolean;
  location: string;
  locationLat: number | null;
  locationLng: number | null;
  locationMode: LocationMode;
  locationSupporting: string;
  statusContext?: string;
}

interface CalendarParts {
  day: string;
  month: string;
  time: string;
  weekday: string;
}

export function PlanVisualOverview({
  cost,
  costSupporting,
  dateTime,
  dateTimeIso,
  dateTimeSupporting,
  isLocationResolved,
  isScheduleResolved,
  location,
  locationLat,
  locationLng,
  locationMode,
  locationSupporting,
  statusContext,
}: PlanVisualOverviewProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <PlanCalendar
        dateTime={dateTime}
        dateTimeIso={dateTimeIso}
        isResolved={isScheduleResolved}
        supporting={dateTimeSupporting}
      />
      <PlanLocationMap
        isResolved={isLocationResolved}
        latitude={locationLat}
        location={location}
        locationMode={locationMode}
        longitude={locationLng}
        supporting={locationSupporting}
      />
      <PlanCostStrip
        cost={cost}
        supporting={costSupporting}
        statusContext={statusContext}
      />
    </div>
  );
}

function PlanCalendar({
  dateTime,
  dateTimeIso,
  isResolved,
  supporting,
}: {
  dateTime: string;
  dateTimeIso: string | null;
  isResolved: boolean;
  supporting?: string;
}) {
  const calendar = getCalendarParts(dateTimeIso);
  const countdown = getCountdownLabel(supporting);

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border/65 bg-card/55 p-4 sm:p-5">
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-12 size-40 rounded-full bg-forge-teal/8 blur-3xl"
      />
      <p className="relative font-bold text-muted-foreground text-xs">
        When it happens
      </p>

      {isResolved && calendar ? (
        <div className="relative mt-4 flex items-center gap-4">
          <div className="w-20 shrink-0 overflow-hidden rounded-xl border border-forge-teal/30 bg-canvas text-center shadow-[0_12px_36px_rgb(0_0_0/25%)]">
            <p className="bg-forge-teal py-1.5 font-black text-[0.65rem] text-white uppercase tracking-[0.18em]">
              {calendar.month}
            </p>
            <p className="py-2 font-black text-3xl text-foreground leading-none">
              {calendar.day}
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground text-lg leading-tight">
              {calendar.weekday}
            </p>
            <p className="mt-1 font-semibold text-forge-teal">
              {calendar.time}
            </p>
            <p className="mt-1 truncate text-muted-foreground text-xs">
              {dateTime}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative mt-4 flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-forge-teal/10 text-forge-teal">
            <CalendarClock className="size-7" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">Decide together</p>
            <p className="mt-1 text-muted-foreground text-sm">{dateTime}</p>
          </div>
        </div>
      )}

      <div className="relative mt-5 flex items-center justify-between gap-3 border-border/60 border-t pt-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Clock3 className="size-4 text-forge-teal" aria-hidden="true" />
          {isResolved ? "Countdown" : "Planning state"}
        </div>
        <p className="font-bold text-foreground text-sm">{countdown}</p>
      </div>
    </article>
  );
}

function PlanLocationMap({
  isResolved,
  latitude,
  location,
  locationMode,
  longitude,
  supporting,
}: {
  isResolved: boolean;
  latitude: number | null;
  location: string;
  locationMode: LocationMode;
  longitude: number | null;
  supporting: string;
}) {
  if (locationMode === "ONLINE") {
    return <OnlineLocationPanel location={location} supporting={supporting} />;
  }

  const mapUrl = getOpenStreetMapUrl(latitude, longitude);
  const mapContent = (
    <>
      <MapArtwork />
      <div className="absolute inset-0 bg-linear-to-t from-canvas via-canvas/35 to-transparent" />
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 font-bold text-[0.65rem] text-white/85 backdrop-blur-sm">
          {mapUrl ? (
            <>
              Open map
              <ExternalLink className="size-3" aria-hidden="true" />
            </>
          ) : (
            "Meeting area"
          )}
        </span>
      </div>
      <div className="absolute top-[38%] left-[57%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <span className="absolute size-12 animate-pulse rounded-full bg-forge-teal/15 motion-reduce:animate-none" />
        <span className="relative flex size-9 items-center justify-center rounded-full border-4 border-canvas bg-forge-teal text-white shadow-lg">
          <MapPin className="size-4" strokeWidth={2.5} aria-hidden="true" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="font-bold text-white text-xs">Where to meet</p>
        <p className="mt-1 font-extrabold text-white text-xl leading-tight [text-shadow:0_2px_12px_rgb(0_0_0/80%)]">
          {location}
        </p>
        <p className="mt-1 font-medium text-sm text-white/70">{supporting}</p>
      </div>
    </>
  );
  const className =
    "relative min-h-52 overflow-hidden rounded-2xl border border-forge-teal/20 bg-(--grouped-menu-selected) text-left";

  if (!mapUrl || !isResolved) {
    return <article className={className}>{mapContent}</article>;
  }

  return (
    <a
      className={cn(
        className,
        "block transition-colors hover:border-forge-teal/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      href={mapUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${location} in OpenStreetMap`}
    >
      {mapContent}
    </a>
  );
}

function MapArtwork() {
  return (
    <svg
      viewBox="0 0 520 260"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 size-full text-white"
    >
      <path
        d="M-30 58C54 28 119 91 196 66S341 12 555 54"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".09"
        strokeWidth="18"
      />
      <path
        d="M-28 181C74 144 118 220 221 184s172-99 339-78"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".1"
        strokeWidth="12"
      />
      <path
        d="M75-30c5 62 22 99 68 137s70 75 80 171"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".08"
        strokeWidth="10"
      />
      <path
        d="M418-25c-42 57-53 106-36 148 18 44 8 88-31 156"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".09"
        strokeWidth="14"
      />
      <path
        d="M-20 220C102 180 151 150 249 137s170-54 291-113"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".24"
        strokeWidth="2"
      />
      <path
        d="M0 104c94 14 169 60 238 55 68-5 134-52 282-56"
        fill="none"
        stroke="#149f98"
        strokeOpacity=".75"
        strokeWidth="3"
        strokeDasharray="7 8"
      />
    </svg>
  );
}

function OnlineLocationPanel({
  location,
  supporting,
}: {
  location: string;
  supporting: string;
}) {
  return (
    <article className="relative min-h-52 overflow-hidden rounded-2xl border border-forge-teal/25 bg-(--grouped-menu-selected) p-5">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgb(20_159_152/18%),transparent_38%)]"
        aria-hidden="true"
      />
      <div className="relative flex size-full min-h-42 flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-full bg-forge-teal/12 text-forge-teal">
            <Wifi className="size-5" aria-hidden="true" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forge-teal/10 px-2.5 py-1 font-bold text-[0.65rem] text-forge-teal">
            <Radio className="size-3" aria-hidden="true" />
            Online
          </span>
        </div>
        <div>
          <p className="font-bold text-white text-xs">Where to meet</p>
          <p className="mt-1 font-extrabold text-white text-xl">{location}</p>
          <p className="mt-1 font-medium text-sm text-white/65">{supporting}</p>
        </div>
      </div>
    </article>
  );
}

function PlanCostStrip({
  cost,
  statusContext,
  supporting,
}: {
  cost: string;
  statusContext?: string;
  supporting?: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-border/60 border-y px-1 py-4 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
          <Banknote className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-muted-foreground text-xs">Cost</p>
          <p className="font-extrabold text-foreground text-lg">{cost}</p>
        </div>
        {supporting ? (
          <p className="border-border/70 border-l pl-3 text-muted-foreground text-sm">
            {supporting}
          </p>
        ) : null}
      </div>
      {statusContext ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="size-2 rounded-full bg-forge-teal" />
          {statusContext}
        </div>
      ) : null}
    </div>
  );
}

function getCalendarParts(dateTimeIso: string | null): CalendarParts | null {
  if (!dateTimeIso) {
    return null;
  }

  const date = new Date(dateTimeIso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date),
  };
}

function getCountdownLabel(supporting?: string) {
  if (!supporting) {
    return "Not scheduled";
  }

  return supporting.replace(/^In\s+/i, "");
}

function getOpenStreetMapUrl(
  latitude: number | null,
  longitude: number | null,
) {
  if (latitude === null || longitude === null) {
    return null;
  }

  const params = new URLSearchParams({
    mlat: String(latitude),
    mlon: String(longitude),
  });
  return `https://www.openstreetmap.org/?${params.toString()}#map=15/${latitude}/${longitude}`;
}
