export interface AboutCard {
  id: number;
  title: string;
  description: string;
  variant: "default" | "credo";
  footer?: string;
}

export const ABOUT_CARDS: AboutCard[] = [
  {
    id: 1,
    title: "Our story",
    description:
      "Social media promised to connect everyone. Event platforms listed thousands of activities. Dating-style apps tried to cross over into friendships. Yet the core problem remained: you still had to browse, scroll, message, and hope someone would show up.",
    variant: "default",
  },
  {
    id: 2,
    title: "The Goal",
    description:
      "We wanted something different – a system that understands your personality, knows your interests, respects your social circle, and hands you a ready-made compatible group in seconds. So we built TeamForge. The system suggests, you show up.",
    variant: "default",
  },
  {
    id: 3,
    title: "Brand credo",
    description:
      '"We are not a dating app. We are not a corporate tool. We are the forge – and every spark is a real connection."',
    footer: "TeamForge brand credo.",
    variant: "credo",
  },
];
