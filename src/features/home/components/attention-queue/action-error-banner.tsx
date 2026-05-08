export function ActionErrorBanner({ error }: { error: string }) {
  return (
    <li className="border-destructive/15 border-b bg-destructive/8 px-3 py-3 font-medium text-foreground text-sm">
      {error}
    </li>
  );
}
