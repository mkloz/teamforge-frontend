import {
  Flame,
  MessageCircle,
  Network,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export const FEATURES = [
  {
    icon: Network,
    title: "Deep Personality Matching",
    description:
      "We analyze all four dimensions of your personality – E/I, S/N, T/F, J/P – to find people who genuinely think like you, not just share the same label.",
    pill: "Deep Matching",
    pillColor: "teal" as const,
    hero: true,
  },
  {
    icon: Flame,
    title: "One-Tap Formation",
    description:
      "Our system evaluates thousands of candidate combinations instantly. Your ideal group in under 2 seconds.",
    pill: "< 2 sec",
    pillColor: "amber" as const,
    hero: false,
  },
  {
    icon: ShieldCheck,
    title: "Adaptive Trust Score",
    description:
      "Peer ratings after every meetup. Recent behavior matters most, so past mistakes fade. Consistency is always rewarded.",
    pill: "Forgiving by design",
    pillColor: "teal" as const,
    hero: false,
  },
  {
    icon: Users,
    title: "Social Fabric Bonus",
    description:
      "Friends and friends-of-friends are naturally prioritized. New groups feel familiar from the first message.",
    pill: "Socially aware",
    pillColor: "teal" as const,
    hero: false,
  },
  {
    icon: RefreshCw,
    title: "Smart Replacement",
    description:
      "If a member leaves, we find the best fit for the remaining group composition – chemistry preserved.",
    pill: "Auto-rebalanced",
    pillColor: "teal" as const,
    hero: false,
  },
  {
    icon: MessageCircle,
    title: "Integrated Group Chat",
    description:
      "Built-in real-time chat with a pinned meetup card for every forged group. Private DMs included.",
    pill: "Real-time",
    pillColor: "amber" as const,
    hero: false,
  },
  {
    icon: SlidersHorizontal,
    title: "Interest-Filtered Activities",
    description:
      "Browse activities across Sport, Technology, Art, Social, and more. We surface activities uniquely aligned to your personality.",
    pill: "Personalised",
    pillColor: "teal" as const,
    hero: false,
  },
];
