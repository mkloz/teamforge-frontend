import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";

export type ProductCheck =
  | {
      kind: "label";
      name: string | RegExp;
      visibility?: "attached" | "visible";
    }
  | {
      kind: "role";
      level?: number;
      name: string | RegExp;
      role: "complementary" | "heading" | "region";
      visibility?: "attached" | "visible";
    }
  | {
      kind: "text";
      name: string | RegExp;
      visibility?: "attached" | "visible";
    };

export interface PlaywrightAuditRoute {
  expectedFailedRequestPatterns?: string[];
  path: string;
  productChecks: ProductCheck[];
  slug: string;
}

type PlaywrightRouteSet = "authenticated" | "smoke";

const routeInventoryItemSchema = z.object({
  expectedFailedRequestPatterns: z.array(z.string()).optional(),
  path: z.string(),
  slug: z.string(),
});

const routeInventoryPayloadSchema = z
  .object({
    routes: z.array(routeInventoryItemSchema).catch([]),
  })
  .passthrough();

type RouteInventoryItem = z.infer<typeof routeInventoryItemSchema>;

const PLAYWRIGHT_SMOKE_ROUTE_SLUGS = ["14-home", "15-explore", "17-activity"];
const PLAYWRIGHT_AUTHENTICATED_ROUTE_SLUGS = [
  "14-home",
  "15-explore",
  "16-group-detail-sample",
  "17-activity",
  "18-profile",
  "19-user-detail-sample",
  "20-settings",
  "21-plan-creation",
];
const PLAYWRIGHT_ACCESSIBILITY_ROUTE_SLUGS = [
  "01-landing",
  "02-download",
  "14-home",
  "15-explore",
  "17-activity",
  "21-plan-creation",
];

const PLAYWRIGHT_ROUTE_INVENTORY: Record<string, RouteInventoryItem> = {
  "01-landing": {
    path: "/",
    slug: "01-landing",
  },
  "02-download": {
    path: "/download",
    slug: "02-download",
  },
  "14-home": {
    path: "/home",
    slug: "14-home",
  },
  "15-explore": {
    path: "/explore",
    slug: "15-explore",
  },
  "16-group-detail-sample": {
    path: "/groups/audit-group-id",
    slug: "16-group-detail-sample",
  },
  "17-activity": {
    path: "/activity",
    slug: "17-activity",
  },
  "18-profile": {
    path: "/profile",
    slug: "18-profile",
  },
  "19-user-detail-sample": {
    path: "/users/audit-user-id",
    slug: "19-user-detail-sample",
  },
  "20-settings": {
    path: "/settings",
    slug: "20-settings",
  },
  "21-plan-creation": {
    path: "/plans/new",
    slug: "21-plan-creation",
  },
};

const PLAYWRIGHT_ROUTE_CONTRACTS: Record<string, PlaywrightAuditRoute> = {
  "14-home": {
    path: "/home",
    productChecks: [
      {
        kind: "label",
        name: "Active groups and sharing",
      },
    ],
    slug: "14-home",
  },
  "15-explore": {
    path: "/explore",
    productChecks: [
      {
        kind: "role",
        level: 1,
        name: "Explore",
        role: "heading",
        visibility: "attached",
      },
      {
        kind: "text",
        name: "Browse open groups by activity, date, location, and available seats.",
        visibility: "attached",
      },
    ],
    slug: "15-explore",
  },
  "16-group-detail-sample": {
    path: "/groups/audit-group-id",
    productChecks: [
      {
        kind: "label",
        name: "Show group QR code",
      },
      {
        kind: "role",
        name: "About this group",
        role: "region",
        visibility: "attached",
      },
      {
        kind: "role",
        name: "Group decision panel",
        role: "complementary",
        visibility: "attached",
      },
    ],
    slug: "16-group-detail-sample",
  },
  "17-activity": {
    path: "/activity",
    productChecks: [
      {
        kind: "role",
        level: 1,
        name: "Activity",
        role: "heading",
        visibility: "attached",
      },
      {
        kind: "role",
        name: "Activity",
        role: "region",
        visibility: "attached",
      },
    ],
    slug: "17-activity",
  },
  "18-profile": {
    path: "/profile",
    productChecks: [
      {
        kind: "label",
        name: "Show QR Code",
      },
      {
        kind: "text",
        name: "Profile sketch",
        visibility: "attached",
      },
    ],
    slug: "18-profile",
  },
  "19-user-detail-sample": {
    path: "/users/audit-user-id",
    productChecks: [
      {
        kind: "text",
        name: "Profile sketch",
        visibility: "attached",
      },
    ],
    slug: "19-user-detail-sample",
  },
  "20-settings": {
    path: "/settings",
    productChecks: [
      {
        kind: "role",
        level: 1,
        name: "Settings",
        role: "heading",
      },
      {
        kind: "role",
        level: 2,
        name: "Update your profile details",
        role: "heading",
        visibility: "attached",
      },
    ],
    slug: "20-settings",
  },
  "21-plan-creation": {
    path: "/plans/new",
    productChecks: [
      {
        kind: "role",
        level: 1,
        name: "What are you trying to make happen?",
        role: "heading",
      },
      {
        kind: "label",
        name: "Start a plan",
      },
    ],
    slug: "21-plan-creation",
  },
};

function normalizeRouteSet(value: string | undefined): PlaywrightRouteSet {
  return value === "smoke" ? "smoke" : "authenticated";
}

function getDefaultRouteSlugs(routeSet: PlaywrightRouteSet) {
  return routeSet === "smoke"
    ? PLAYWRIGHT_SMOKE_ROUTE_SLUGS
    : PLAYWRIGHT_AUTHENTICATED_ROUTE_SLUGS;
}

function readRouteInventory(filePath: string): RouteInventoryItem[] {
  const parsedPayload = routeInventoryPayloadSchema.safeParse(
    JSON.parse(readFileSync(filePath, "utf8")),
  );

  return parsedPayload.success ? parsedPayload.data.routes : [];
}

function readResolvedRouteInventory() {
  const routeFilePath = process.env.AUDIT_PLAYWRIGHT_ROUTES_FILE;

  return routeFilePath && existsSync(routeFilePath)
    ? readRouteInventory(routeFilePath)
    : null;
}

function getRouteInventoryBySlugs(routeSlugs: string[]) {
  const resolvedRoutes = readResolvedRouteInventory();
  const routeBySlug = new Map(
    (resolvedRoutes ?? Object.values(PLAYWRIGHT_ROUTE_INVENTORY)).map(
      (route) => [route.slug, route],
    ),
  );

  return routeSlugs
    .map((slug) => routeBySlug.get(slug) ?? PLAYWRIGHT_ROUTE_INVENTORY[slug])
    .filter((route): route is RouteInventoryItem => Boolean(route))
    .filter(hasResolvedDynamicPath);
}

function hasResolvedDynamicPath(route: RouteInventoryItem) {
  if (route.slug === "16-group-detail-sample") {
    return !route.path.includes("audit-group-id");
  }

  if (route.slug === "19-user-detail-sample") {
    return !route.path.includes("audit-user-id");
  }

  return true;
}

function mergeRouteContract(route: RouteInventoryItem) {
  const contract = PLAYWRIGHT_ROUTE_CONTRACTS[route.slug];

  if (!contract || !hasResolvedDynamicPath(route)) {
    return null;
  }

  return {
    ...contract,
    expectedFailedRequestPatterns:
      route.expectedFailedRequestPatterns ??
      contract.expectedFailedRequestPatterns,
    path: route.path,
  };
}

export function getPlaywrightAuditRoutes() {
  const routeSet = normalizeRouteSet(process.env.AUDIT_PLAYWRIGHT_ROUTE_SET);

  return getRouteInventoryBySlugs(getDefaultRouteSlugs(routeSet))
    .map(mergeRouteContract)
    .filter((route): route is PlaywrightAuditRoute => Boolean(route));
}

export function getPlaywrightAccessibilityRoutes() {
  return getRouteInventoryBySlugs(PLAYWRIGHT_ACCESSIBILITY_ROUTE_SLUGS);
}
