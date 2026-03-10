import { cn } from "@/shared/lib/utils";
import { ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { PersonalizedTemplate } from "../types/home.types";

interface TemplateCardProps {
  template: PersonalizedTemplate;
  onSelect: (template: PersonalizedTemplate) => void;
}

function getIcon(iconName: string) {
  const Icon = LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Sparkles;
  return Icon;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const Icon = getIcon(template.icon);

  return (
    <button
      onClick={() => onSelect(template)}
      className={cn(
        "group flex flex-col gap-3 p-4 rounded-2xl text-left",
        "bg-card border border-border hover:border-accent/50",
        "transition-all duration-200 hover:shadow-lg hover:shadow-accent/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
        <Icon size={20} className="text-accent" />
      </div>

      {/* Title */}
      <h4 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
        {template.title}
      </h4>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2">
        {template.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pt-2">
        {template.suggestedTags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 text-accent font-semibold text-sm pt-2 group-hover:gap-3 transition-all">
        <span>Create</span>
        <ArrowRight size={14} className="shrink-0" />
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
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={onSelectTemplate}
          />
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
