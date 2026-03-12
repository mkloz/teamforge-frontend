import { MapPin, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { UserProfile } from "../types/profile.types";

interface ProfileHeroProps {
  profile: UserProfile;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Avatar */}
      <div className="relative mb-4">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover ring-4 ring-primary/20 shadow-xl bg-muted"
        />
      </div>

      {/* Name and Age */}
      <h1 className="text-2xl font-bold text-foreground">
        {profile.name}, {profile.age}
      </h1>

      {/* Location */}
      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
        <MapPin size={14} />
        <span className="text-sm">{profile.location}</span>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        {/* MBTI Type Badge */}
        <Badge variant="mbti" className="text-xs">
          {profile.mbtiType}
        </Badge>

        {/* Trust Score Badge */}
        <Badge 
          variant="outline" 
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        >
          <Shield size={12} className="mr-1" />
          {profile.trustScore}%
        </Badge>

        {/* Archetype Badge */}
        <Badge 
          variant="outline" 
          className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30"
        >
          <Sparkles size={12} className="mr-1" />
          {profile.archetype}
        </Badge>
      </div>

      {/* Bio Quote */}
      <blockquote className="mt-6 px-4 py-3 border-l-2 border-primary bg-muted/30 rounded-r-lg max-w-sm">
        <p className="text-sm italic text-muted-foreground leading-relaxed">
          "{profile.bio}"
        </p>
      </blockquote>
    </div>
  );
}
