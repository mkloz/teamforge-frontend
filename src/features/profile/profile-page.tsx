import { ProfileHero } from "./components/profile-hero";
import { PersonalitySection } from "./components/personality-section";
import { InterestsCloud } from "./components/interests-cloud";
import { MOCK_PROFILE } from "./data/mock-profile";

export function ProfilePage() {
  const profile = MOCK_PROFILE;
  
  return (
    <div className="min-h-full">
      {/* Desktop: two-column layout, Mobile: single column */}
      <div className="lg:flex lg:gap-8 lg:max-w-5xl lg:mx-auto">
        {/* Left column - Hero (sticky on desktop) */}
        <div className="lg:w-[320px] lg:flex-shrink-0">
          <div className="lg:sticky lg:top-4 p-6 lg:p-0">
            <ProfileHero profile={profile} />
          </div>
        </div>
        
        {/* Right column - Content (scrollable) */}
        <div className="flex-1 p-4 lg:p-0 lg:py-4 space-y-6">
          {/* Personality Section */}
          <PersonalitySection profile={profile} />
          
          {/* Interests */}
          <InterestsCloud interests={profile.interests} />
        </div>
      </div>
    </div>
  );
}
