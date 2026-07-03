export function FriendsPanelHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="font-black text-2xl text-foreground leading-tight tracking-tight">
        {title}
      </h2>
      <p className="font-medium text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
