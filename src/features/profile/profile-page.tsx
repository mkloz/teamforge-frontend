export function ProfilePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-foreground">Profile</h1>
      <p className="text-muted-foreground leading-relaxed">
        Your profile showcases your MBTI type, trust score, interests, and
        activity history. Edit your profile settings or view your stats.
      </p>
      <div className="mt-4 p-6 rounded-2xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Placeholder content — the full Profile page will be built next.
        </p>
      </div>
    </div>
  );
}
