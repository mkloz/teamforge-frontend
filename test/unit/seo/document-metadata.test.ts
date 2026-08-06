// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

import { applyDocumentMetadata } from "@/shared/lib/document-metadata";
import { createPublicPageMetadata } from "@/shared/lib/seo/public-page-metadata";

function resetHead() {
  document.head.innerHTML = `
    <title>Original title</title>
    <link rel="canonical" href="https://teamforge.example/" />
    <meta name="robots" content="index, follow" />
    <script type="application/ld+json" data-teamforge-json-ld="public-site">{"old":true}</script>
  `;
}

afterEach(resetHead);

describe("document metadata", () => {
  it("updates and restores canonical, social, and structured metadata", () => {
    resetHead();
    const restore = applyDocumentMetadata(createPublicPageMetadata("/"));

    expect(document.title).toContain("TeamForge");
    expect(
      document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
        ?.href,
    ).toBe("http://localhost:3000/");
    expect(
      document.head
        .querySelector('meta[property="og:url"]')
        ?.getAttribute("content"),
    ).toBe("http://localhost:3000/");
    expect(
      document.head.querySelector(
        'script[data-teamforge-json-ld="public-site"]',
      )?.textContent,
    ).toContain('"Organization"');

    restore();

    expect(document.title).toBe("Original title");
    expect(
      document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
        ?.href,
    ).toBe("https://teamforge.example/");
    expect(
      document.head.querySelector(
        'script[data-teamforge-json-ld="public-site"]',
      )?.textContent,
    ).toBe('{"old":true}');
  });

  it("can remove public discovery metadata while a protected route is active", () => {
    resetHead();
    const restore = applyDocumentMetadata({
      title: "TeamForge",
      links: [{ rel: "canonical", href: null }],
      jsonLd: [{ id: "public-site", value: null }],
      meta: [
        {
          name: "robots",
          content: "noindex, nofollow, noarchive, nosnippet, noimageindex",
        },
      ],
    });

    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(
      document.head.querySelector(
        'script[data-teamforge-json-ld="public-site"]',
      ),
    ).toBeNull();
    expect(
      document.head
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content"),
    ).toContain("noindex");

    restore();
    expect(document.head.querySelector('link[rel="canonical"]')).not.toBeNull();
  });
});
