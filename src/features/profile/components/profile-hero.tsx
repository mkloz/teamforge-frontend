import { MapPin, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { UserProfile } from "../types/profile.types";

interface ProfileHeroProps {
  profile: UserProfile;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  return (
    <div className="relative flex flex-col items-center text-center animate-fade-up">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl" />
      
      {/* Avatar */}
      <div className="relative mb-4">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover shadow-lg bg-muted"
        />
        {/* Online indicator */}
        <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-background" />
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

      {/* Badges Row - brand colors */}
      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        {/* MBTI Type Badge - primary teal */}
        <Badge className="bg-primary text-primary-foreground font-mono font-bold">
          {profile.mbtiType}
        </Badge>

        {/* Trust Score Badge - teal outline */}
        <Badge 
          variant="outline" 
          className="bg-primary/10 text-primary border-primary/30"
        >
          <Shield size={12} className="mr-1" />
          {profile.trustScore}%
        </Badge>

        {/* Archetype Badge - amber accent */}
        <Badge 
          variant="outline" 
          className="bg-accent/10 text-accent border-accent/30"
        >
          <Sparkles size={12} className="mr-1" />
          {profile.archetype}
        </Badge>
      </div>

      {/* Bio Quote */}
      <blockquote className="mt-6 px-4 py-3 border-l-2 border-primary/50 bg-card rounded-r-xl max-w-sm shadow-sm">
        <p className="text-sm text-muted-foreground leading-relaxed">
          "{profile.bio}"
        </p>
      </blockquote>
    </div>
  );
}
