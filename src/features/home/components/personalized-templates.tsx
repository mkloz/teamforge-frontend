import { cn } from "@/shared/lib/utils";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { PersonalizedTemplate } from "../types/home.types";

interface TemplateCardProps {
  template: PersonalizedTemplate;
  onSelect: (template: PersonalizedTemplate) => void;
}

function getIcon(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[iconName] || Sparkles;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const Icon = getIcon(template.icon);

  return (
    <button
      onClick={() => onSelect(template)}
      className={cn(
        "group relative overflow-hidden rounded-2xl text-left",
        "border border-border transition-all duration-200",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-black/10",
        "dark:hover:shadow-black/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {/* Background gradient/image */}
      <div
        className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
        style={{
          background: template.backgroundImage,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40" />

      {/* Content */}
      <div className="relative flex flex-col gap-3 p-5 h-full">
        {/* Icon badge */}
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 group-hover:bg-white/25 transition-colors">
          <Icon size={24} className="text-white" />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Title */}
        <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors leading-tight">
          {template.title}
        </h4>

        {/* Description */}
        <p className="text-sm text-white/80 line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {template.suggestedTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 text-white font-semibold text-sm pt-3 group-hover:gap-3 transition-all">
          <span>Create</span>
          <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
}

interface PersonalizedTemplatesProps {
  templates: PersonalizedTemplate[];
  onSelectTemplate: (template: PersonalizedTemplate) => void;
}

export function PersonalizedTemplates({
  templates,
  onSelectTemplate,
}: PersonalizedTemplatesProps) {
  if (templates.length === 0) return null;

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Create Your Own Activity
      </h3>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="min-h-64">
            <TemplateCard
              template={template}
              onSelect={onSelectTemplate}
            />
          </div>
        ))}
      </div>

      {/* Inspirational text */}
      <p className="text-xs text-muted-foreground pt-2">
        Based on your interests in{" "}
        <span className="font-semibold text-foreground">
          {templates[0]?.interests.slice(0, 2).join(", ")}
        </span>
        . Start an activity and invite others to join.
      </p>
    </div>
  );
}
