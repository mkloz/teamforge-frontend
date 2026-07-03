import {
  authPublicRoutes,
  authRedirectRoute,
} from "@/app/router/public-routes/auth-routes";
import {
  downloadRoute,
  landingRoute,
  legalPublicRoutes,
} from "@/app/router/public-routes/marketing-routes";

export const publicRoutes = [
  landingRoute,
  downloadRoute,
  ...legalPublicRoutes,
  authRedirectRoute,
  ...authPublicRoutes,
];
