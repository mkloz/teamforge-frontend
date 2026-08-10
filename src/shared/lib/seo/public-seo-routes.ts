export const PUBLIC_SEO_ROUTES = [
  {
    path: "/",
    title: "Findafew | Small groups for things you want to do.",
    description:
      "For adults aged 18–28 at launch: explore activity plans or start your own, then review the group and practical details before deciding.",
    indexable: true,
    lastModified: "2026-08-09",
    socialImage: {
      path: "/group-covers/flat-social-map.png",
      alt: "Abstract Findafew map of small groups around shared activities",
      width: 1672,
      height: 941,
    },
  },
  {
    path: "/download",
    title: "Install Findafew | iPhone, Android & Desktop",
    description:
      "Install Findafew on iPhone, iPad, Android, or desktop with a step-by-step guide for supported browsers and devices.",
    indexable: true,
    lastModified: "2026-08-09",
    socialImage: {
      path: "/group-covers/flat-social-map.png",
      alt: "Findafew, available as an installable web app",
      width: 1672,
      height: 941,
    },
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Findafew",
    description:
      "Learn how Findafew handles, protects, and manages your personal data.",
    indexable: false,
    lastModified: null,
  },
  {
    path: "/terms",
    title: "Terms of Service | Findafew",
    description:
      "Read the rules, requirements, and policies for using the Findafew platform.",
    indexable: false,
    lastModified: null,
  },
] as const;

export type PublicSeoPath = (typeof PUBLIC_SEO_ROUTES)[number]["path"];
export type PublicSeoRoute = (typeof PUBLIC_SEO_ROUTES)[number];

export const INDEXABLE_PUBLIC_PATHS = PUBLIC_SEO_ROUTES.filter(
  ({ indexable }) => indexable,
).map(({ path }) => path) as readonly PublicSeoPath[];

export const DRAFT_PUBLIC_PATHS = PUBLIC_SEO_ROUTES.filter(
  ({ indexable }) => !indexable,
).map(({ path }) => path) as readonly PublicSeoPath[];

const INDEXABLE_PUBLIC_PATH_SET = new Set<string>(INDEXABLE_PUBLIC_PATHS);

function normalizePathname(pathname: string) {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/u, "");
}

export function isIndexablePublicPath(pathname: string) {
  return INDEXABLE_PUBLIC_PATH_SET.has(normalizePathname(pathname));
}

export function getPublicSeoRoute(path: PublicSeoPath) {
  const route = PUBLIC_SEO_ROUTES.find((candidate) => candidate.path === path);

  if (!route) {
    throw new Error(`Missing public SEO route metadata for ${path}.`);
  }

  return route;
}

export function createFindafewStructuredData({
  homepageUrl,
  logoUrl,
}: {
  homepageUrl: string;
  logoUrl: string;
}) {
  const organizationId = `${homepageUrl}#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Findafew",
        url: homepageUrl,
        logo: logoUrl,
        description: PUBLIC_SEO_ROUTES[0].description,
      },
      {
        "@type": "WebSite",
        "@id": `${homepageUrl}#website`,
        url: homepageUrl,
        name: "Findafew",
        description: PUBLIC_SEO_ROUTES[0].description,
        publisher: { "@id": organizationId },
      },
    ],
  };
}

export const SENSITIVE_NAVIGATION_PATTERN = /^\/(?:auth|invite)(?:\/|$)/u;

export const PROTECTED_ROUTE_HEADER_PATHS = [
  "/home",
  "/home/*",
  "/explore",
  "/explore/*",
  "/groups",
  "/groups/*",
  "/plans",
  "/plans/*",
  "/activity",
  "/activity/*",
  "/profile",
  "/profile/*",
  "/users",
  "/users/*",
  "/settings",
  "/settings/*",
  "/safety",
  "/safety/*",
  "/plans/new",
  "/group-proposals/*",
  "/onboarding",
  "/onboarding/*",
  "/admin",
  "/admin/*",
  "/operator",
  "/operator/*",
  "/auth",
  "/auth/*",
  "/invite",
  "/invite/*",
] as const;

export const TOKEN_ROUTE_HEADER_PATHS = [
  "/invite/*",
  "/auth/reset-password/*",
  "/auth/activate/*",
] as const;
