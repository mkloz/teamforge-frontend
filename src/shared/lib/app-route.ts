export { buildHomeNavigation } from "./home-route";

export function buildProfileNavigation() {
  return {
    to: "/profile",
  } as const;
}
