import { useState } from "react";
import type { Activity } from "../types/home.types";
import { ActivityCard } from "./activity-card";

interface ActivityFeedProps {
  activities: Activity[];
}

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Tech", value: "Tech" },
  { label: "Sports", value: "Sports" },
  { label: "Arts", value: "Arts" },
  { label: "Social", value: "Social" },
  { label: "Outdoors", value: "Outdoors" },
];

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered =
    selectedCategory === "all"
      ? activities
      : activities.filter((a) => a.category === selectedCategory);

  if (activities.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recommended For You
        </h3>
        <div className="p-6 rounded-xl bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            No activities yet. Check back soon or explore personalized templates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Recommended For You
      </h3>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
              selectedCategory === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Activity grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-6 rounded-xl bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            No activities in this category. Try a different filter.
          </p>
        </div>
      )}
    </div>
  );
}
