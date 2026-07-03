import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";
import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";

export interface InterestsBrowseProps {
  categories: Interest[];
  leafById: Record<string, Interest>;
  selectedIds: Set<string>;
  searchQuery: string;
  searchResults: InterestSearchResults;
  personalityType: PersonalityType | null;
  suggestedTags: Interest[];
  youMightAlsoLike: Interest[];
  showBalanceNudge: boolean;
  isAtMax: boolean;
  collapsedCategories: Set<string>;
  expandedSubcategories: Set<string>;
  onToggle: (id: string) => void;
  onToggleCategory: (id: string) => void;
  onToggleSubcategory: (id: string) => void;
  onRegisterCategory: (id: string, element: HTMLElement | null) => void;
  onReject: (id: string) => void;
  hideContextLabel?: boolean;
}

export interface InterestsBrowseViewState {
  isSearching: boolean;
  openCategories: string[];
  shouldShowSuggestions: boolean;
  shouldShowYouMightAlsoLike: boolean;
}

export interface InterestsDiscoveryContentProps {
  categories: Interest[];
  expandedSubcategories: Set<string>;
  isAtMax: boolean;
  personalityType: PersonalityType | null;
  selectedIds: Set<string>;
  showBalanceNudge: boolean;
  suggestedTags: Interest[];
  viewState: InterestsBrowseViewState;
  youMightAlsoLike: Interest[];
  onAccordionChange: (newValues: string[]) => void;
  onRegisterCategory: (id: string, element: HTMLElement | null) => void;
  onReject: (id: string) => void;
  onToggle: (id: string) => void;
  onToggleSubcategory: (id: string) => void;
}

export interface SearchResultsOverlayProps {
  isAtMax: boolean;
  searchQuery: string;
  searchResults: InterestSearchResults;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}
