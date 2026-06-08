export const appShellEase = {
  enter: [0.22, 1, 0.36, 1] as [number, number, number, number],
} as const;

export const appShellMotionTiming = {
  sidebarEnter: 0.18,
  navEnter: 0.16,
  initialContentEnter: 0.22,
  routeContentEnter: 0.17,
  reducedMotion: 0.08,
} as const;

export const appShellMotionDelay = {
  navEnter: 0.03,
  initialContentEnter: 0.07,
  routeContentEnter: 0.03,
} as const;
