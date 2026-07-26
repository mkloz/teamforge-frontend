import type { LucideIcon } from "lucide-react";

interface LandingFeaturePoint {
  detail?: string;
  icon: LucideIcon;
  title: string;
}

interface LandingFeaturePointListProps {
  detailClassName?: string;
  itemClassName: string;
  listClassName: string;
  points: readonly LandingFeaturePoint[];
}

const DEFAULT_DETAIL_CLASS_NAME =
  "mt-2 font-medium text-sm text-text-dark-secondary leading-relaxed";

export function LandingFeaturePointList({
  detailClassName = DEFAULT_DETAIL_CLASS_NAME,
  itemClassName,
  listClassName,
  points,
}: LandingFeaturePointListProps) {
  return (
    <ul className={listClassName}>
      {points.map(({ detail, icon: Icon, title }) => (
        <li key={title} className={itemClassName}>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
                <Icon className="size-3.5" aria-hidden="true" strokeWidth={2} />
              </span>
              <h3 className="font-black text-base text-white leading-snug">
                {title}
              </h3>
            </div>
            {detail ? <p className={detailClassName}>{detail}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
