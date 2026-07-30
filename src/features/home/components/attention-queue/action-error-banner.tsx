export function ActionErrorBanner({ error }: { error: string }) {
  return (
    <li className="rounded-xl border border-destructive/15 bg-destructive/8 px-3 py-3 font-medium text-destructive text-sm lg:col-span-2">
      {error}
    </li>
  );
}
