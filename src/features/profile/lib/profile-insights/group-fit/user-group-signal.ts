import type { PortraitKey, UserGroupSignal } from "../types";

export function buildUserGroupSignal(key: PortraitKey): UserGroupSignal {
  const signals: Record<PortraitKey, UserGroupSignal> = {
    activeCatalyst: {
      connectionStyle: {
        description: "You cut through awkwardness with action.",
        value: "Direct",
      },
      groupEnergy: {
        description: "You bring momentum to the plan.",
        value: "High",
      },
      socialRhythm: {
        description: "You prefer getting straight into things.",
        value: "Fast",
      },
    },
    cafeConnector: {
      connectionStyle: {
        description: "You make it easy to start chatting.",
        value: "Warm",
      },
      groupEnergy: {
        description: "You keep the vibe casual.",
        value: "Relaxed",
      },
      socialRhythm: {
        description: "You help conversations flow naturally.",
        value: "Steady",
      },
    },
    calmAnchor: {
      connectionStyle: {
        description: "You give people space to arrive.",
        value: "Observant",
      },
      groupEnergy: {
        description: "You lower the pressure in the room.",
        value: "Grounded",
      },
      socialRhythm: {
        description: "You prefer a relaxed, steady tempo.",
        value: "Paced",
      },
    },
    creativeInstigator: {
      connectionStyle: {
        description: "You may start interesting conversations.",
        value: "Playful",
      },
      groupEnergy: {
        description: "You bring fresh energy to the group.",
        value: "Dynamic",
      },
      socialRhythm: {
        description: "You keep things from feeling rigid.",
        value: "Spontaneous",
      },
    },
    curiousSpecialist: {
      connectionStyle: {
        description: "You connect deeply on shared topics.",
        value: "Focused",
      },
      groupEnergy: {
        description: "You bring interest to the activity.",
        value: "Engaged",
      },
      socialRhythm: {
        description: "You prefer meaningful exchanges.",
        value: "Measured",
      },
    },
    focusedBuilder: {
      connectionStyle: {
        description: "You connect through shared tasks.",
        value: "Practical",
      },
      groupEnergy: {
        description: "You help the group make progress.",
        value: "Directed",
      },
      socialRhythm: {
        description: "You bring a sense of purpose.",
        value: "Structured",
      },
    },
    flexibleParticipant: {
      connectionStyle: {
        description: "You read the room well.",
        value: "Adaptable",
      },
      groupEnergy: {
        description: "You adapt to the group's natural pace.",
        value: "Fluid",
      },
      socialRhythm: {
        description: "You fit into different social flows.",
        value: "Easygoing",
      },
    },
    ideaFirstExplorer: {
      connectionStyle: {
        description: "You bond over new concepts.",
        value: "Inquisitive",
      },
      groupEnergy: {
        description: "You keep the group exploring.",
        value: "Curious",
      },
      socialRhythm: {
        description: "You adapt to where the idea goes.",
        value: "Variable",
      },
    },
    playfulScout: {
      connectionStyle: {
        description: "You keep introductions easy.",
        value: "Light",
      },
      groupEnergy: {
        description: "You make it easy for new people to join.",
        value: "Breezy",
      },
      socialRhythm: {
        description: "You keep the mood lifted.",
        value: "Upbeat",
      },
    },
    practicalOrganizer: {
      connectionStyle: {
        description: "You communicate intentions directly.",
        value: "Clear",
      },
      groupEnergy: {
        description: "You give the group shape.",
        value: "Anchored",
      },
      socialRhythm: {
        description: "You bring steady momentum.",
        value: "Reliable",
      },
    },
    quietSpecialist: {
      connectionStyle: {
        description: "You connect when there's substance.",
        value: "Thoughtful",
      },
      groupEnergy: {
        description: "You don't overwhelm the group.",
        value: "Contained",
      },
      socialRhythm: {
        description: "You engage at your own pace.",
        value: "Deliberate",
      },
    },
    restlessInstigator: {
      connectionStyle: {
        description: "You jump straight into the action.",
        value: "Quick",
      },
      groupEnergy: {
        description: "You want things to keep moving.",
        value: "Restless",
      },
      socialRhythm: {
        description: "You set a fast pace for the group.",
        value: "Accelerated",
      },
    },
    socialGameHost: {
      connectionStyle: {
        description: "You may help people take part.",
        value: "Inviting",
      },
      groupEnergy: {
        description: "You lift the social energy.",
        value: "Buoyant",
      },
      socialRhythm: {
        description: "You keep the interaction flowing.",
        value: "Animated",
      },
    },
    steadyHost: {
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
    },
    tasteMaker: {
      connectionStyle: {
        description: "You bond over shared aesthetics.",
        value: "Discerning",
      },
      groupEnergy: {
        description: "You pay attention to the setting and details.",
        value: "Considered",
      },
      socialRhythm: {
        description: "You prefer a thoughtful pace.",
        value: "Thoughtful",
      },
    },
    warmConnector: {
      connectionStyle: {
        description: "You read people easily.",
        value: "Empathetic",
      },
      groupEnergy: {
        description: "You make the group feel safe.",
        value: "Welcoming",
      },
      socialRhythm: {
        description: "You smooth over early awkwardness.",
        value: "Harmonious",
      },
    },
  };

  return signals[key];
}
