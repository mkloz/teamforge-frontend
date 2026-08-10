import { ThemeColor } from "@/shared/constants/theme-preferences";

export const COLOR_OPTIONS = [
  {
    value: ThemeColor.GRAPHITE,
    label: "Balanced",
    description: "Neutral and steady for everyday use.",
    tag: "Core",
    personality:
      "True black, clean neutrals, teal, and a measured amber accent.",
    swatches: {
      light: [
        "bg-[#F4F4F2]",
        "bg-[#FFFFFF]",
        "bg-[#E9E9E6]",
        "bg-[#0F766E]",
        "bg-[#D98F00]",
      ],
      dark: [
        "bg-[#000000]",
        "bg-[#111111]",
        "bg-[#1C1C1C]",
        "bg-[#378371]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.TEAL,
    label: "Quiet focus",
    description: "Low-stimulation surfaces for focused sessions.",
    tag: "Core",
    personality: "Soft sage neutrals with muted teal and gentle warmth.",
    swatches: {
      light: [
        "bg-[#F1F3EF]",
        "bg-[#FBFCF8]",
        "bg-[#E7EBE5]",
        "bg-[#347A70]",
        "bg-[#B98545]",
      ],
      dark: [
        "bg-[#111513]",
        "bg-[#1D231F]",
        "bg-[#272E29]",
        "bg-[#62B2A4]",
        "bg-[#D3AA76]",
      ],
    },
  },
  {
    value: ThemeColor.EMBER,
    label: "Warm social",
    description: "Welcoming and expressive without becoming loud.",
    tag: "Core",
    personality: "Clay-warm neutrals, grounded teal, and richer ember.",
    swatches: {
      light: [
        "bg-[#F5EEE5]",
        "bg-[#FFFAF3]",
        "bg-[#EEE3D7]",
        "bg-[#137B73]",
        "bg-[#C96D2D]",
      ],
      dark: [
        "bg-[#15100D]",
        "bg-[#241C17]",
        "bg-[#2E251F]",
        "bg-[#49B7AA]",
        "bg-[#EE9B61]",
      ],
    },
  },
  {
    value: ThemeColor.MONO,
    label: "Clear contrast",
    description: "Stronger separation and easier visual scanning.",
    tag: "Specialized",
    personality:
      "Crisp neutral layers with high-clarity teal and ember signals.",
    swatches: {
      light: [
        "bg-[#F5F4F0]",
        "bg-[#FFFFFF]",
        "bg-[#E4E5E1]",
        "bg-[#08776F]",
        "bg-[#A95F17]",
      ],
      dark: [
        "bg-[#080A09]",
        "bg-[#171A18]",
        "bg-[#232725]",
        "bg-[#55CEC0]",
        "bg-[#F0AD6A]",
      ],
    },
  },
  {
    value: ThemeColor.HARBOR,
    label: "Night ease",
    description: "Cooler layers for comfortable low-light use.",
    tag: "Specialized",
    personality: "Blue-charcoal depth, quiet teal, and soft amber warmth.",
    swatches: {
      light: [
        "bg-[#EDF1EF]",
        "bg-[#FBFDFB]",
        "bg-[#E1E8E5]",
        "bg-[#127B75]",
        "bg-[#B97A38]",
      ],
      dark: [
        "bg-[#0B1113]",
        "bg-[#172124]",
        "bg-[#222D30]",
        "bg-[#378371]",
        "bg-[#D8A56F]",
      ],
    },
  },
] as const;
