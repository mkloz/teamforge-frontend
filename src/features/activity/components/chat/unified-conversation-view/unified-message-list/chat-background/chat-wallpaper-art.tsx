import { type ComponentPropsWithoutRef, memo } from "react";

type ChatWallpaperArtProps = Pick<ComponentPropsWithoutRef<"div">, "className">;

const panelClassName = [
  "absolute rounded-2xl border border-slate-muted/20 bg-canvas/55 shadow-sm",
  "dark:border-slate-muted/14 dark:bg-canvas/30",
].join(" ");

const lineClassName =
  "block h-1 rounded-full bg-slate-muted/32 dark:bg-slate-muted/24";

const dotClassName = [
  "absolute size-3 rounded-full border border-slate-muted/30 bg-canvas",
  "dark:border-slate-muted/20 dark:bg-canvas",
].join(" ");

const routeLineClassName =
  "absolute h-px origin-left bg-forge-teal/35 dark:bg-forge-teal/28";

export const ChatWallpaperArt = memo(function ChatWallpaperArt({
  className,
}: ChatWallpaperArtProps) {
  return (
    <div aria-hidden="true" className={className}>
      <div
        className={`${panelClassName} top-[15%] left-[7%] h-28 w-44 rotate-[-7deg]`}
      >
        <span className={`${lineClassName} absolute top-6 left-5 w-20`} />
        <span className={`${lineClassName} absolute top-11 left-5 w-28`} />
        <span className={`${lineClassName} absolute top-16 left-5 w-16`} />
        <span className="absolute right-5 bottom-5 size-7 rounded-full bg-forge-teal/14 ring-1 ring-forge-teal/22" />
      </div>

      <div
        className={`${panelClassName} top-[10%] right-[9%] h-24 w-36 rotate-6`}
      >
        <span className="absolute top-5 left-5 size-8 rounded-full bg-spark-amber/16 ring-1 ring-spark-amber/20" />
        <span className={`${lineClassName} absolute top-7 left-16 w-12`} />
        <span className={`${lineClassName} absolute top-12 left-16 w-9`} />
        <span className={`${lineClassName} absolute bottom-5 left-5 w-24`} />
      </div>

      <div
        className={`${panelClassName} bottom-[13%] left-[12%] h-20 w-40 rotate-3`}
      >
        <span className={`${lineClassName} absolute top-5 left-5 w-24`} />
        <span className={`${lineClassName} absolute top-10 left-5 w-16`} />
        <span className="absolute bottom-4 left-5 h-5 w-16 rounded-full bg-forge-teal/12 ring-1 ring-forge-teal/18" />
      </div>

      <div
        className={`${panelClassName} right-[13%] bottom-[16%] h-24 w-44 rotate-[-5deg]`}
      >
        <span className={`${lineClassName} absolute top-6 left-5 w-28`} />
        <span className={`${lineClassName} absolute top-12 left-5 w-20`} />
        <span className="absolute right-5 bottom-5 h-6 w-12 rounded-full bg-spark-amber/14 ring-1 ring-spark-amber/20" />
      </div>

      <div className="absolute top-1/2 left-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-forge-teal/18" />
      <div className="absolute top-1/2 left-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-spark-amber/14" />

      <span
        className={`${routeLineClassName} top-[36%] left-[21%] w-[18%] rotate-12`}
      />
      <span
        className={`${routeLineClassName} top-[34%] right-[24%] w-[14%] rotate-154`}
      />
      <span
        className={`${routeLineClassName} bottom-[31%] left-[27%] w-[18%] rotate-[-18deg]`}
      />
      <span
        className={`${routeLineClassName} right-[24%] bottom-[34%] w-[16%] rotate-18`}
      />

      <span className={`${dotClassName} top-[35%] left-[20%]`} />
      <span className={`${dotClassName} top-[32%] right-[23%]`} />
      <span className={`${dotClassName} bottom-[30%] left-[26%]`} />
      <span className={`${dotClassName} right-[23%] bottom-[33%]`} />
    </div>
  );
});
