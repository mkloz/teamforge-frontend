import {
  authPublicRoutes,
  authRedirectRoute,
} from "@/app/router/public-routes/auth-routes";
import {
  downloadRoute,
  externalInviteRoute,
  externalInviteTokenRoute,
  landingRoute,
  legalPublicRoutes,
} from "@/app/router/public-routes/marketing-routes";

export const publicRoutes = [
  landingRoute,
  downloadRoute,
  externalInviteRoute,
  externalInviteTokenRoute,
  ...legalPublicRoutes,
  authRedirectRoute,
  ...authPublicRoutes,
];
