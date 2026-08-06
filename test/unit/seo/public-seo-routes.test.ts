import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import {
  INDEXABLE_PUBLIC_PATHS,
  isIndexablePublicPath,
  PROTECTED_ROUTE_HEADER_PATHS,
  PUBLIC_SEO_ROUTES,
  SENSITIVE_NAVIGATION_PATTERN,
  TOKEN_ROUTE_HEADER_PATHS,
} from "@/shared/lib/seo/public-seo-routes";

describe("public SEO route policy", () => {
  it("allows only intentionally public content routes to be indexed", () => {
    expect(INDEXABLE_PUBLIC_PATHS).toEqual([
      "/",
      "/download",
      "/privacy",
      "/terms",
    ]);

    for (const pathname of [
      "/home",
      "/groups/group-id",
      "/plans/plan-id/guest",
      "/users/user-id",
      "/auth/login",
      "/invite/secret",
      "/admin",
      "/not-a-real-route",
    ]) {
      expect(isIndexablePublicPath(pathname)).toBe(false);
    }
  });

  it("normalizes a public route's trailing slash without widening scope", () => {
    expect(isIndexablePublicPath("/download/")).toBe(true);
    expect(isIndexablePublicPath("/downloads")).toBe(false);
  });

  it("keeps token-bearing navigations out of the service-worker fallback", () => {
    expect(SENSITIVE_NAVIGATION_PATTERN.test("/invite/secret")).toBe(true);
    expect(
      SENSITIVE_NAVIGATION_PATTERN.test("/auth/reset-password/secret"),
    ).toBe(true);
    expect(SENSITIVE_NAVIGATION_PATTERN.test("/download")).toBe(false);
  });

  it("keeps route metadata unique and complete", () => {
    expect(new Set(PUBLIC_SEO_ROUTES.map(({ path }) => path)).size).toBe(
      PUBLIC_SEO_ROUTES.length,
    );

    for (const route of PUBLIC_SEO_ROUTES) {
      expect(route.title.length).toBeGreaterThan(10);
      expect(route.description.length).toBeGreaterThan(50);
      expect(route.description.length).toBeLessThanOrEqual(160);
    }
  });
});
describe("deployed crawler containment sources", () => {
  it("sets response-level noindex directives on every protected family", async () => {
    const headersFile = await readFile("public/_headers", "utf8");

    for (const route of PROTECTED_ROUTE_HEADER_PATHS) {
      expect(headersFile).toContain(
        `${route}\n  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex`,
      );
    }
  });

  it("prevents token routes from being cached or leaking referrers", async () => {
    const headersFile = await readFile("public/_headers", "utf8");

    for (const route of TOKEN_ROUTE_HEADER_PATHS) {
      expect(headersFile).toContain(
        `${route}\n  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex\n  Cache-Control: private, no-store\n  Referrer-Policy: no-referrer`,
      );
    }
  });

  it("publishes only public routes in sitemap and llms.txt", async () => {
    const [sitemap, llms] = await Promise.all([
      readFile("public/sitemap.xml", "utf8"),
      readFile("public/llms.txt", "utf8"),
    ]);

    for (const route of INDEXABLE_PUBLIC_PATHS) {
      const suffix = route === "/" ? "/" : route;
      expect(sitemap).toContain(`__TEAMFORGE_APP_URL__${suffix}`);
    }

    for (const privateFragment of [
      "/groups/",
      "/plans/",
      "/users/",
      "/activity",
      "/admin",
    ]) {
      expect(sitemap).not.toContain(privateFragment);
      expect(llms).not.toContain(`](__TEAMFORGE_APP_URL__${privateFragment}`);
    }
  });
});
