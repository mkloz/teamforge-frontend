import { Avatar } from "@/shared/components/common/avatar";

interface ProfileAvatarProps {
  src: string | null;
  name: string;
}

export function ProfileAvatar({ src, name }: ProfileAvatarProps) {
  return (
    <div className="shrink-0 relative group">
      <div className="absolute inset-0 rounded-full bg-spark-amber/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -inset-1.5 border-2 border-forge-teal/30 rounded-full transition duration-700 opacity-0 group-hover:opacity-100 group-hover:rotate-180 group-hover:scale-105" />
      <Avatar
        src={src}
        name={name}
        className="relative z-10 h-38 w-38 border-thick border-canvas bg-muted text-4xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02] sm:h-38 sm:w-38"
        fallbackClassName="bg-forge-teal/10 text-4xl"
        loading="eager"
      />
      <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-forge-teal border-2 border-canvas z-20 shadow-sm flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-forge-teal animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75" />
      </div>
    </div>
  );
}
