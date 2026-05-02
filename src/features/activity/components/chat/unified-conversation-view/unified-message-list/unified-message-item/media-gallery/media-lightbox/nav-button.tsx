import { memo } from "react";

export const NavButton = memo(
  ({
    onClick,
    icon,
  }: {
    onClick: (e: React.MouseEvent) => void;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="w-14 h-14 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition pointer-events-auto backdrop-blur-md active:scale-90 hover:scale-105"
    >
      {icon}
    </button>
  ),
);
