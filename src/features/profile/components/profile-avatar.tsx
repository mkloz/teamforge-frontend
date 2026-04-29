interface ProfileAvatarProps {
  src: string | null;
  name: string;
}

export function ProfileAvatar({ src, name }: ProfileAvatarProps) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TF";

  return (
    <div className="shrink-0 relative group">
      <div className="absolute inset-0 rounded-full bg-spark-amber/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -inset-1.5 border-2 border-forge-teal/30 rounded-full transition duration-700 opacity-0 group-hover:opacity-100 group-hover:rotate-180 group-hover:scale-105" />
      {src ? (
        <img
          src={src}
          alt={name}
          className="relative w-38 h-38 sm:w-38 sm:h-38 rounded-full object-cover border-thick border-canvas bg-muted shadow-lg z-10 transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="relative flex w-38 h-38 sm:w-38 sm:h-38 items-center justify-center rounded-full border-thick border-canvas bg-forge-teal/10 text-4xl font-black text-forge-teal shadow-lg z-10 transition-transform duration-300 group-hover:scale-[1.02]">
          {initials}
        </div>
      )}
      <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-forge-teal border-2 border-canvas z-20 shadow-sm flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-forge-teal animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75" />
      </div>
    </div>
  );
}
