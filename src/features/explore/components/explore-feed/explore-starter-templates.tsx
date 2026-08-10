import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MapPin,
  Star,
  Ticket,
  UsersRound,
  Wifi,
} from "lucide-react";
import {
  ACTIVITY_TEMPLATE_STARTING_POINTS,
  type ActivityTemplateStartingPoint,
} from "@/features/plan-creation/public/canonical-activity-templates";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { buildPlanCreationTemplateLaunchNavigation } from "@/shared/navigation";

export function ExploreStarterTemplates() {
  return (
    <section
      aria-labelledby="explore-starter-templates-heading"
      className="py-8 sm:py-10"
    >
      <div className="max-w-3xl">
        <h2
          id="explore-starter-templates-heading"
          className="text-balance font-black text-2xl text-foreground leading-tight tracking-tight sm:text-3xl"
        >
          Start something people can join
        </h2>
        <p className="mt-2 max-w-2xl text-pretty font-medium text-muted-foreground text-sm leading-6">
          Choose a ready-made activity and make it yours. You can change every
          detail before the plan goes live.
        </p>
      </div>

      <ul
        aria-label="Starter activity templates"
        className="mt-6 grid max-w-4xl list-none gap-3 p-0"
      >
        {ACTIVITY_TEMPLATE_STARTING_POINTS.map((startingPoint) => (
          <li key={startingPoint.templateId}>
            <StarterTemplateCard startingPoint={startingPoint} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function StarterTemplateCard({
  startingPoint,
}: {
  startingPoint: ActivityTemplateStartingPoint;
}) {
  const isOnline = startingPoint.locationType === "ONLINE";
  const LocationIcon = isOnline ? Wifi : MapPin;

  return (
    <Link
      {...buildPlanCreationTemplateLaunchNavigation(startingPoint.templateId)}
      aria-label={`Start ${startingPoint.title} from template`}
      className="group relative grid min-h-28 min-w-0 grid-cols-[6.5rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-border/70 border-dashed bg-card/45 text-left outline-none transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-1 hover:border-foreground/35 hover:shadow-soft-md focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:translate-y-0 motion-reduce:transition-none sm:min-h-32 sm:grid-cols-[8.75rem_minmax(0,1fr)]"
    >
      <PlanCover
        value={startingPoint.coverImage}
        alt=""
        className="size-full bg-muted"
        imageClassName="size-full object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
        fallbackComponent={
          <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
            <Star className="size-6" aria-hidden="true" />
          </div>
        }
      />

      <div className="relative flex min-w-0 flex-col justify-center p-3 pr-10 sm:p-4 sm:pr-12">
        <p className="font-semibold text-muted-foreground text-xs leading-none">
          {startingPoint.categoryLabel} · starter template
        </p>
        <h3 className="mt-1.5 line-clamp-1 font-bold text-base text-foreground leading-tight sm:text-lg">
          {startingPoint.title}
        </h3>
        <p className="mt-1 line-clamp-2 font-medium text-muted-foreground text-xs leading-5 sm:text-sm">
          {startingPoint.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-muted-foreground text-xs">
          <TemplateFact
            icon={UsersRound}
            label={formatGroupSize(startingPoint)}
          />
          <TemplateFact
            icon={LocationIcon}
            label={isOnline ? "Online" : "Local"}
          />
          <TemplateFact icon={Ticket} label="Free" />
        </div>

        <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2 font-bold text-foreground text-xs sm:right-4">
          <span className="hidden sm:inline">Use template</span>
          <ArrowRight
            className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

function TemplateFact({
  icon: Icon,
  label,
}: {
  icon: typeof UsersRound;
  label: string;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function formatGroupSize(startingPoint: ActivityTemplateStartingPoint) {
  const { maximumGroupSize, minimumGroupSize } = startingPoint;

  if (minimumGroupSize !== null && maximumGroupSize !== null) {
    return `${minimumGroupSize}–${maximumGroupSize} people`;
  }

  return "Flexible group";
}
