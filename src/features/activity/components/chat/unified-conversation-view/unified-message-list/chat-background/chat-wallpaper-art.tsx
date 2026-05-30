import { memo, type SVGProps } from "react";

import chatWallpaperArtUrl from "./chat-wallpaper-art.svg";

type ChatWallpaperArtProps = Pick<SVGProps<SVGSVGElement>, "className">;

export const ChatWallpaperArt = memo(function ChatWallpaperArt({
  className,
}: ChatWallpaperArtProps) {
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
      <use href={`${chatWallpaperArtUrl}#chat-wallpaper-art`} />
    </svg>
  );
});
