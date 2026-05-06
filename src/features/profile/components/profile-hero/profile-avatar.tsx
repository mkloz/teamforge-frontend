import { Avatar } from "@/shared/components/common/avatar";

interface ProfileAvatarProps {
  src: string | null;
  name: string;
}

export function ProfileAvatar({ src, name }: ProfileAvatarProps) {
  return (
    <div className="group relative shrink-0">
      <div className="absolute inset-0 rounded-full bg-spark-amber/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -inset-1.5 border-2 border-forge-teal/30 rounded-full transition duration-700 opacity-0 group-hover:opacity-100 group-hover:rotate-180 group-hover:scale-105" />
      <Avatar
        src={src}
        name={name}
        className="relative z-10 h-32 w-32 border-thick border-canvas bg-muted text-3xl shadow-lg ring-1 ring-border/70 transition-[scale,transform] duration-300 group-hover:scale-[1.02] sm:h-38 sm:w-38 sm:text-4xl"
        fallbackClassName="bg-muted text-forge-teal text-3xl sm:text-4xl"
        loading="eager"
      />
      <div className="absolute bottom-2 right-2 z-20 h-5 w-5 rounded-full border-2 border-canvas bg-forge-teal shadow-sm sm:bottom-3 sm:right-3" />
    </div>
  );
}
