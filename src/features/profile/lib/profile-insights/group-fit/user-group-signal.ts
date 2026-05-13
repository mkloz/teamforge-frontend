import type { UserGroupSignal } from "../types";

export function buildUserGroupSignal(): UserGroupSignal {
  return {
    connectionStyle: {
      description: "You find common ground fast.",
      value: "Curious",
    },
    groupEnergy: {
      description: "You help plans feel easier to join.",
      value: "Steady",
    },
    socialRhythm: {
      description: "You bring steady energy to new groups.",
      value: "Grounded",
    },
  };
}
