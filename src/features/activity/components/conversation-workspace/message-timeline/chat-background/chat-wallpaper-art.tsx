import type { SVGProps } from "react";

type ChatWallpaperArtProps = Pick<SVGProps<SVGSVGElement>, "className">;

const CHAT_WALLPAPER_ART_URL =
  "/activity/chat-wallpaper/chat-wallpaper-art.svg";

export function ChatWallpaperArt({ className }: ChatWallpaperArtProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      viewBox="-144 -81 2336 1315"
      xmlns="http://www.w3.org/2000/svg"
    >
      <use href={`${CHAT_WALLPAPER_ART_URL}#chat-wallpaper-art`} />
    </svg>
  );
}
