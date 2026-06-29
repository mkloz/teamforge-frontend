import { lazy, Suspense } from "react";

const LazyChatWallpaperArt = lazy(async () => {
  const wallpaperModule = await import("./chat-wallpaper-art");

  return { default: wallpaperModule.ChatWallpaperArt };
});

const wallpaperCanvasClassName = [
  "pointer-events-none absolute inset-0 z-0 select-none overflow-hidden bg-canvas [contain:paint]",
  "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_3%,transparent)_0%,transparent_34%,transparent_68%,color-mix(in_srgb,var(--accent)_3%,transparent)_100%)]",
  "dark:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_4%,transparent)_0%,transparent_36%,transparent_70%,color-mix(in_srgb,var(--accent)_4%,transparent)_100%)]",
].join(" ");

const wallpaperArtClassName = [
  "absolute inset-0 size-full origin-center scale-[1.08] text-slate-muted opacity-[0.36]",
  "[mask-image:linear-gradient(90deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.76)_18%,rgba(0,0,0,0.5)_44%,rgba(0,0,0,0.5)_56%,rgba(0,0,0,0.76)_82%,rgba(0,0,0,0.95)_100%)]",
  "[-webkit-mask-image:linear-gradient(90deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.76)_18%,rgba(0,0,0,0.5)_44%,rgba(0,0,0,0.5)_56%,rgba(0,0,0,0.76)_82%,rgba(0,0,0,0.95)_100%)]",
  "dark:opacity-[0.22]",
  "max-md:scale-[1.18] max-md:opacity-30 max-md:dark:opacity-20",
].join(" ");

const readingVeilClassName = [
  "absolute inset-0",
  "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-canvas)_10%,transparent)_0%,color-mix(in_srgb,var(--color-canvas)_36%,transparent)_18%,color-mix(in_srgb,var(--color-canvas)_66%,transparent)_46%,color-mix(in_srgb,var(--color-canvas)_66%,transparent)_54%,color-mix(in_srgb,var(--color-canvas)_36%,transparent)_82%,color-mix(in_srgb,var(--color-canvas)_10%,transparent)_100%),linear-gradient(180deg,color-mix(in_srgb,var(--color-canvas)_72%,transparent)_0%,transparent_16%,transparent_78%,color-mix(in_srgb,var(--color-canvas)_72%,transparent)_100%)]",
  "dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-canvas)_8%,transparent)_0%,color-mix(in_srgb,var(--color-canvas)_30%,transparent)_18%,color-mix(in_srgb,var(--color-canvas)_54%,transparent)_46%,color-mix(in_srgb,var(--color-canvas)_54%,transparent)_54%,color-mix(in_srgb,var(--color-canvas)_30%,transparent)_82%,color-mix(in_srgb,var(--color-canvas)_8%,transparent)_100%),linear-gradient(180deg,color-mix(in_srgb,var(--color-canvas)_62%,transparent)_0%,transparent_16%,transparent_78%,color-mix(in_srgb,var(--color-canvas)_62%,transparent)_100%)]",
  "max-md:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-canvas)_8%,transparent)_0%,color-mix(in_srgb,var(--color-canvas)_50%,transparent)_22%,color-mix(in_srgb,var(--color-canvas)_62%,transparent)_50%,color-mix(in_srgb,var(--color-canvas)_50%,transparent)_78%,color-mix(in_srgb,var(--color-canvas)_8%,transparent)_100%),linear-gradient(180deg,color-mix(in_srgb,var(--color-canvas)_74%,transparent)_0%,transparent_18%,transparent_76%,color-mix(in_srgb,var(--color-canvas)_74%,transparent)_100%)]",
  "max-md:dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-canvas)_8%,transparent)_0%,color-mix(in_srgb,var(--color-canvas)_30%,transparent)_18%,color-mix(in_srgb,var(--color-canvas)_54%,transparent)_46%,color-mix(in_srgb,var(--color-canvas)_54%,transparent)_54%,color-mix(in_srgb,var(--color-canvas)_30%,transparent)_82%,color-mix(in_srgb,var(--color-canvas)_8%,transparent)_100%),linear-gradient(180deg,color-mix(in_srgb,var(--color-canvas)_62%,transparent)_0%,transparent_16%,transparent_78%,color-mix(in_srgb,var(--color-canvas)_62%,transparent)_100%)]",
].join(" ");

export function ChatBackground() {
  return (
    <div className={wallpaperCanvasClassName}>
      <Suspense fallback={null}>
        <LazyChatWallpaperArt className={wallpaperArtClassName} />
      </Suspense>
      <div className={readingVeilClassName} />
    </div>
  );
}
