export interface RouteGuardLocationLike {
  pathname: string;
  searchStr: string;
}

export interface PublicAuthRouteLoadContext {
  location: {
    searchStr: string;
  };
}

export interface RequireAuthenticatedUserOptions {
  onSessionRestored?: () => void | Promise<void>;
}
