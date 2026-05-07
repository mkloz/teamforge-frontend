import type { ReactNode } from "react";

interface HomeSectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function HomeSectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
}: HomeSectionHeadingProps) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs leading-none font-bold text-forge-teal">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className="mt-1 text-lg leading-tight font-black tracking-tight text-foreground sm:text-xl md:text-2xl"
        >
          {title}
        </h2>
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
      {description ? (
        <p className="col-span-2 max-w-2xl text-sm leading-6 font-medium text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
