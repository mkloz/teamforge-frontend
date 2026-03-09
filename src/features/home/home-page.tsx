export function HomePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-foreground">Home</h1>
      <p className="text-muted-foreground leading-relaxed">
        Welcome to your TeamForge home. This page will display your greeting
        banner, active groups, and recommended activities.
      </p>
      <div className="mt-4 p-6 rounded-2xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Placeholder content — the full Home page will be built next.
        </p>
      </div>
    </div>
  );
}
