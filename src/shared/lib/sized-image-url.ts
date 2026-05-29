export function getSizedImageUrl(
  src: string | null | undefined,
  width: number,
) {
  if (!src) {
    return src;
  }

  try {
    const url = new URL(src);
    const safeWidth = Math.max(32, Math.round(width));

    if (url.hostname === "i.pravatar.cc") {
      url.pathname = `/${safeWidth}`;
      return url.toString();
    }

    if (url.hostname.endsWith("images.unsplash.com")) {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(safeWidth));
      url.searchParams.set("q", "75");
      return url.toString();
    }

    return src;
  } catch {
    return src;
  }
}
