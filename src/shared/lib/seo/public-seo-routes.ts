export const PUBLIC_SEO_ROUTES = [
  {
    path: "/",
    title: "TeamForge | Find your people, intelligently.",
    description:
      "TeamForge forms small, compatible groups for shared real-world activities using personality, interests, and social context.",
    lastModified: "2026-06-04",
    socialImage: {
      path: "/group-covers/flat-social-map.png",
      alt: "Abstract TeamForge map of compatible groups forming around shared activities",
      width: 1672,
      height: 941,
    },
  },
  {
    path: "/download",
    title: "Install TeamForge | iPhone, Android & Desktop",
    description:
      "Install TeamForge on iPhone, iPad, Android, or desktop with a step-by-step guide for supported browsers and devices.",
    lastModified: "2026-06-04",
    socialImage: {
      path: "/group-covers/flat-social-map.png",
      alt: "TeamForge, available as an installable web app",
      width: 1672,
      height: 941,
    },
  },
  {
    path: "/privacy",
    title: "Privacy Policy | TeamForge",
    description:
      "Learn how TeamForge handles, protects, and manages your personal data.",
    lastModified: "2026-06-04",
  },
  {
    path: "/terms",
    title: "Terms of Service | TeamForge",
    description:
      "Read the rules, requirements, and policies for using the TeamForge platform.",
    lastModified: "2026-06-04",
  },
] as const;

export type PublicSeoPath = (typeof PUBLIC_SEO_ROUTES)[number]["path"];
export type PublicSeoRoute = (typeof PUBLIC_SEO_ROUTES)[number];

export const INDEXABLE_PUBLIC_PATHS = PUBLIC_SEO_ROUTES.map(
  ({ path }) => path,
) as readonly PublicSeoPath[];

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

export function createTeamForgeStructuredData({
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
        name: "TeamForge",
        url: homepageUrl,
        logo: logoUrl,
        description: PUBLIC_SEO_ROUTES[0].description,
      },
      {
        "@type": "WebSite",
        "@id": `${homepageUrl}#website`,
        url: homepageUrl,
        name: "TeamForge",
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
  "/forge",
  "/forge/*",
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
