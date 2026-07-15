import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const TECH_TEMPLATES: TemplateSeed[] = [
  {
    id: "build",
    title: "Side project night",
    description: "Work on a coding or hardware project alongside other people.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/build/original.webp",
    ),
    groupName: "Side Project Builders",
    groupDescription: "A group for making progress on personal tech projects.",
    fixedSize: 4,
    interestHints: ["side projects", "coding", "technology"],
  },
  {
    id: "brainstorm",
    title: "Test a product idea",
    description:
      "Bring a product idea, ask practical questions, and decide what to test first.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/brainstorm/original.webp",
    ),
    groupName: "Product Idea Testers",
    groupDescription: "A group for discussing early product ideas.",
    fixedSize: 5,
    interestHints: ["product design", "startups", "technology"],
  },
  {
    id: "demo-night",
    title: "Tech demo night",
    description: "Show a project, explain how it works, and ask for feedback.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/demo-night/original.webp",
    ),
    groupName: "Tech Demo Night",
    groupDescription: "A group for sharing tech projects and useful feedback.",
    fixedSize: 5,
    interestHints: ["technology", "coding", "product demos"],
  },
  {
    id: "ai-lab",
    title: "AI task workshop",
    description: "Use an AI tool on an everyday task, then check the result.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/ai-lab/original.webp",
    ),
    groupName: "Practical AI Workshop",
    groupDescription: "A group for trying AI tools on practical tasks.",
    fixedSize: 4,
    interestHints: ["artificial intelligence", "technology", "tools"],
  },
  {
    id: "career-sprint",
    title: "Tech career meetup",
    description: "Review CVs, portfolios, and technical interview questions.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/career-sprint/original.webp",
    ),
    groupName: "Tech Career Meetup",
    groupDescription: "A group for tech job searches and interview practice.",
    fixedSize: 4,
    interestHints: ["tech careers", "portfolio", "interviews"],
  },
  {
    id: "code-review",
    title: "Peer code review",
    description: "Bring a small piece of code and review it with the group.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/code-review/original.webp",
    ),
    groupName: "Peer Code Review",
    groupDescription: "A group for constructive code reviews.",
    fixedSize: 4,
    interestHints: ["code review", "programming", "software development"],
  },
  {
    id: "founder-chat",
    title: "Startup problem-solving",
    description: "Discuss current startup problems and share practical advice.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/founder-chat/original.webp",
    ),
    groupName: "Startup Problem-Solvers",
    groupDescription: "A group for people building early-stage companies.",
    fixedSize: 5,
    interestHints: ["startups", "founders", "business"],
  },
  {
    id: "tool-share",
    title: "Software tool demos",
    description:
      "Show one useful app or developer tool and explain how you use it.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/tool-share/original.webp",
    ),
    groupName: "Software Tool Demos",
    groupDescription: "A group for sharing useful software and workflows.",
    fixedSize: 5,
    interestHints: ["software tools", "technology", "productivity"],
  },
  {
    id: "hack-night",
    title: "Build a small app",
    description: "Choose a simple app idea and start coding it together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/hack-night/original.webp",
    ),
    groupName: "Small App Builders",
    groupDescription: "A group for building small software projects together.",
    fixedSize: 4,
    interestHints: ["coding", "software projects", "hackathon"],
  },
  {
    id: "app-teardown",
    title: "App design review",
    description: "Choose an app and discuss what makes it easy or hard to use.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/app-teardown/original.webp",
    ),
    groupName: "App Design Review",
    groupDescription: "A group for reviewing app design and user experience.",
    fixedSize: 5,
    interestHints: ["app design", "user experience", "product"],
  },
  {
    id: "ai-tool-test",
    title: "AI fact-checking practice",
    description:
      "Ask an AI tool a factual question, then verify its answer with reliable sources.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/ai-tool-test/original.webp",
    ),
    groupName: "AI Fact Checkers",
    groupDescription:
      "A group for checking AI answers against reliable sources.",
    fixedSize: 4,
    interestHints: ["artificial intelligence", "fact-checking", "research"],
  },
  {
    id: "portfolio-build",
    title: "Portfolio work night",
    description: "Work on a portfolio site, case study, or project demo.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/portfolio-build/original.webp",
    ),
    groupName: "Portfolio Builders",
    groupDescription:
      "A group for building tech portfolios and sharing feedback.",
    fixedSize: 4,
    interestHints: ["portfolio", "career", "web development"],
  },
  {
    id: "startup-reading",
    title: "Startup case study",
    description:
      "Read about one company and discuss the decisions its team made.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/startup-reading/original.webp",
    ),
    groupName: "Startup Case Study",
    groupDescription:
      "A group for discussing real startup stories and decisions.",
    fixedSize: 5,
    interestHints: ["startups", "business", "case studies"],
  },
  {
    id: "no-code-build",
    title: "No-code project night",
    description:
      "Build a simple website, form, or workflow without programming.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/no-code-build/original.webp",
    ),
    groupName: "No-Code Makers",
    groupDescription: "A group for making useful projects with visual tools.",
    fixedSize: 4,
    interestHints: ["no-code", "software tools", "product"],
  },
  {
    id: "robotics-table",
    title: "Robotics project night",
    description: "Bring a robotics project or discuss motors and sensors.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/robotics-table/original.webp",
    ),
    groupName: "Robotics Builders",
    groupDescription: "A group for hands-on robotics and hardware projects.",
    fixedSize: 5,
    interestHints: ["robotics", "hardware", "engineering"],
  },
  {
    id: "design-systems",
    title: "Interface design workshop",
    description:
      "Compare reusable interface parts and how teams organise them.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/design-systems/original.webp",
    ),
    groupName: "Interface Design Workshop",
    groupDescription:
      "A group for people working on reusable interface design.",
    fixedSize: 4,
    interestHints: ["ui design", "design systems", "product"],
  },
  {
    id: "data-night",
    title: "Data project night",
    description:
      "Explore a small dataset and create a chart or simple analysis.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/data-night/original.webp",
    ),
    groupName: "Data Projects",
    groupDescription: "A group for practical data analysis projects.",
    fixedSize: 4,
    interestHints: ["data analysis", "coding", "visualisation"],
  },
  {
    id: "security-basics",
    title: "Account security check",
    description: "Review password, device, and account settings together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/tech/security-basics/original.webp",
    ),
    groupName: "Account Security Check",
    groupDescription: "A group for learning safer everyday online habits.",
    fixedSize: 4,
    interestHints: ["cybersecurity", "online safety", "technology"],
  },
];
