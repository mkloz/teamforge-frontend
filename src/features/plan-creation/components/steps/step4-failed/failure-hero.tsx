import { Notice } from "@/shared/components/ui/notice";

interface FailureHeroProps {
  description: string;
  title: string;
}

export function FailureHero({ description, title }: FailureHeroProps) {
  return (
    <Notice
      role="alert"
      size="lg"
      statusIcon
      tone="warning"
      className="items-start"
      contentClassName="leading-snug"
    >
      <p>
        <strong className="font-black text-foreground">{title}</strong>
        <span className="mt-1 block text-muted-foreground text-sm leading-relaxed">
          {description}
        </span>
      </p>
    </Notice>
  );
}
