import { Avatar } from "@/shared/components/common/avatar";

interface ProfileAvatarProps {
  src: string | null;
  name: string;
}

export function ProfileAvatar({ src, name }: ProfileAvatarProps) {
  return (
    <div className="group relative shrink-0">
      <div className="absolute inset-0 rounded-full bg-spark-amber/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
      <div className="absolute -inset-1.5 rounded-full border-2 border-forge-teal/30 opacity-0 transition duration-700 group-hover:rotate-180 group-hover:scale-105 group-hover:opacity-100" />
      <Avatar
        src={src}
        name={name}
        className="relative z-10 size-26 border-canvas border-thick bg-muted text-2xl shadow-lg ring-1 ring-border/70 transition-transform duration-300 group-hover:scale-105 sm:size-34 sm:text-4xl"
        fallbackClassName="bg-muted text-forge-teal text-2xl sm:text-4xl"
        loading="eager"
      />
      <div className="absolute right-1.5 bottom-1.5 z-20 size-4 rounded-full border-2 border-canvas bg-forge-teal shadow-sm sm:right-2 sm:bottom-2" />
    </div>
  );
}
