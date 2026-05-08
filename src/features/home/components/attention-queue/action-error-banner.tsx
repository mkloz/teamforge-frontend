export function ActionErrorBanner({ error }: { error: string }) {
  return (
    <li className="border-b border-destructive/15 bg-destructive/8 px-3 py-3 text-sm font-medium text-foreground">
      {error}
    </li>
  );
}
