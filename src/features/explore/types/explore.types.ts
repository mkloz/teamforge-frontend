export type LocationMode = "Any" | "In-Person" | "Online";
export type AccessMode = "All" | "Open" | "Request";
export type SortOption = "match" | "soonest" | "newest";

export interface ExploreFilters {
  selectedCategories: string[];
  sizeRange: [number, number];
  distance: number;
  locationMode: LocationMode;
  access: AccessMode;
  sortBy: SortOption;
}

export interface GroupPreview {
  id: string;
  matchScore: number;
  title: string;
  groupName: string;
  groupAvatarUrl?: string;
  imageUrl?: string;
  date: string;
  distance?: string;
  locationMode: "In-Person" | "Online";
  cost: "Free" | "Paid";
  category: string;
  currentSize: number;
  capacity: number;
  access: "Open" | "By Request";
  isFull?: boolean;
}
