import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { TeamForgeLogo } from "@/assets/logo";
import { Button } from "@/shared/components/ui/button";

type LegalPageKind = "privacy" | "terms";

interface LegalPageProps {
  kind: LegalPageKind;
}

interface LegalSection {
  id: string;
  heading: string;
  body: string;
  bullets: string[];
}

interface LegalPageCopy {
  eyebrow: string;
  title: string;
  summary: string;
  notice: string;
  updatedAt: string;
  sections: LegalSection[];
}

const legalPageCopy: Record<LegalPageKind, LegalPageCopy> = {
  privacy: {
    eyebrow: "Privacy policy",
    title: "How TeamForge handles your data",
    updatedAt: "May 13, 2026",
    summary:
      "TeamForge uses profile, personality, interests, social graph, group, safety, and activity signals to form small compatible groups and keep the service reliable.",
    notice:
      "This is the product-ready privacy policy draft. It should be reviewed by counsel before launch, especially for jurisdiction-specific rights, retention periods, and contact details.",
    sections: [
      {
        id: "scope",
        heading: "1. Scope and controller",
        body: "This policy explains how TeamForge collects, uses, shares, stores, and protects personal information when someone visits the site, creates an account, joins a group, messages others, or uses settings and safety tools.",
        bullets: [
          "Identify the legal TeamForge entity responsible for the service.",
          "State whether the policy covers the website, web app, emails, notifications, and future mobile apps.",
          "Tell users where to send privacy, safety, and account requests.",
        ],
      },
      {
        id: "data-collected",
        heading: "2. Information we collect",
        body: "TeamForge should list every category of data used by the app so users understand what powers their profile, compatibility ranking, and group experience.",
        bullets: [
          "Account data: name, email, password credentials, account status, verification state, and session metadata.",
          "Profile data: avatar, bio, age, gender, city, personality type, OCEAN scores, interests, and trust score.",
          "Group data: groups, members, roles, invites, join requests, plans, proposals, ratings, and attendance or participation signals.",
          "Messages and activity data: chats, attachments, reactions, pinned messages, link previews, reports, blocks, and notification events.",
          "Technical data: device, browser, IP-derived region, logs, performance data, security events, and approximate usage patterns.",
        ],
      },
      {
        id: "sensitive-data",
        heading: "3. Sensitive and inferred data",
        body: "Some TeamForge signals can feel personal even when they are not formal health or medical data. The policy should explain this plainly.",
        bullets: [
          "Personality answers are used to infer a personality type and OCEAN profile.",
          "Interest, social graph, and trust signals may be used to infer likely compatibility with other people.",
          "Location is used at city or plan level unless a precise meeting place is needed for a confirmed plan.",
          "TeamForge should not ask for government IDs, financial data, health data, or exact live location unless the product later adds a clear reason and consent flow.",
        ],
      },
      {
        id: "use",
        heading: "4. How we use information",
        body: "The policy should connect each major use of data to a product function users can understand.",
        bullets: [
          "Create, verify, secure, and recover accounts.",
          "Recommend groups, rank compatibility, form groups, and manage invitations.",
          "Operate chats, group planning, notifications, profile controls, settings, and safety features.",
          "Detect abuse, spam, fake accounts, harassment, and behavior that harms trust.",
          "Improve reliability, debug errors, measure product health, and understand which flows need refinement.",
        ],
      },
      {
        id: "automated-matching",
        heading: "5. Compatibility and automated decisions",
        body: "TeamForge should be transparent that group formation uses automated scoring without exposing algorithm internals in user-facing language.",
        bullets: [
          "Explain that group suggestions are generated from personality, interests, age alignment, social proximity, availability, and trust signals.",
          "State that users can update profile details, interests, and matching preferences to affect future recommendations.",
          "Clarify whether automated recommendations are advisory or whether they create meaningful access restrictions.",
          "Provide a path to ask for help if a user believes a decision or safety action is wrong.",
        ],
      },
      {
        id: "sharing",
        heading: "6. What other users can see",
        body: "Because TeamForge is social, the privacy page should make visibility obvious before people join groups.",
        bullets: [
          "Profile visibility may include name, avatar, bio, city, personality type, interests, trust indicators, and mutual group context.",
          "Group members can see group plans, participants, roles, messages, proposals, and relevant activity.",
          "People may see invite, request, block, or message state when needed to operate the product.",
          "Private account data, credentials, internal safety notes, and raw scoring inputs should not be shown to other users.",
        ],
      },
      {
        id: "processors",
        heading: "7. Service providers and third parties",
        body: "The page should identify categories of vendors and integrations without overpromising exact vendors if they may change.",
        bullets: [
          "Hosting, database, storage, monitoring, analytics, email, notifications, authentication, maps, and anti-abuse providers.",
          "Google services may be used for OAuth or address autocomplete if configured.",
          "External links and link previews may contact third-party sites when users share URLs.",
          "TeamForge should not sell personal information and should disclose any future advertising or cross-context tracking before using it.",
        ],
      },
      {
        id: "legal-bases",
        heading: "8. Legal bases where required",
        body: "If TeamForge serves people in the UK or EEA, the policy should map processing to legal bases.",
        bullets: [
          "Contract: account creation, group formation, messaging, and core app features.",
          "Legitimate interests: security, abuse prevention, product reliability, and service improvement.",
          "Consent: optional marketing, certain cookies, and optional profile or notification choices where required.",
          "Legal obligation: records or disclosures required by law, safety, or valid legal process.",
        ],
      },
      {
        id: "retention",
        heading: "9. Retention and deletion",
        body: "Users should know how long TeamForge keeps information and what happens after deletion.",
        bullets: [
          "Keep account and profile data while the account is active.",
          "Keep messages, group plans, invites, and safety records as needed to operate groups and investigate abuse.",
          "Delete or de-identify data when it is no longer needed, unless retention is required for security, legal, or dispute reasons.",
          "Explain whether deleted accounts remove public profile data, group history, messages, backups, and logs immediately or after a delay.",
        ],
      },
      {
        id: "security",
        heading: "10. Security",
        body: "The policy should describe practical protections without claiming the service is risk-free.",
        bullets: [
          "Use authentication, access controls, encrypted transport, token refresh, logging, and operational safeguards.",
          "Limit access to personal data to people and systems that need it.",
          "Encourage strong passwords, verified email, session review, and prompt reporting of suspicious activity.",
          "Acknowledge that no online service can guarantee perfect security.",
        ],
      },
      {
        id: "rights",
        heading: "11. User choices and privacy rights",
        body: "The page should explain the controls available in the product and any request rights that may apply by location.",
        bullets: [
          "Update profile, avatar, interests, personality answers, matching preferences, notifications, privacy settings, blocks, and sessions.",
          "Request access, correction, deletion, export, restriction, objection, or withdrawal of consent where those rights apply.",
          "California and other US state residents may have additional rights to know, delete, correct, opt out, or limit certain uses.",
          "Users should be told how TeamForge verifies requests and when a request may be limited for safety, legal, or fraud-prevention reasons.",
        ],
      },
      {
        id: "minors",
        heading: "12. Age and minors",
        body: "TeamForge targets adults and should state the minimum age clearly.",
        bullets: [
          "TeamForge is for people 18 and older.",
          "The service should not knowingly collect information from minors.",
          "If TeamForge learns that a minor created an account, it may delete the account and associated data.",
        ],
      },
      {
        id: "transfers",
        heading: "13. International transfers",
        body: "If data may be processed outside the user's country, the policy should say so.",
        bullets: [
          "Data may be processed in countries where TeamForge, hosting providers, or service providers operate.",
          "Where required, TeamForge should use appropriate transfer safeguards.",
          "Users should know that privacy laws may differ between countries.",
        ],
      },
      {
        id: "changes",
        heading: "14. Changes and contact",
        body: "The policy should end with maintenance and contact expectations.",
        bullets: [
          "Post updates on this page with a new effective date.",
          "Notify users of material changes when required or when the change meaningfully affects them.",
          "List the official privacy contact, company address, and any data protection representative once finalized.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms of service",
    title: "The rules for using TeamForge",
    updatedAt: "May 13, 2026",
    summary:
      "TeamForge helps people form small groups for real-world activities. These terms explain account responsibilities, group behavior, content rules, safety expectations, and platform limits.",
    notice:
      "This is the product-ready terms draft. It should be reviewed by counsel before launch, especially for governing law, dispute resolution, liability caps, and company details.",
    sections: [
      {
        id: "acceptance",
        heading: "1. Agreement to these terms",
        body: "The terms should explain that using TeamForge means accepting the rules that govern the service.",
        bullets: [
          "State that the terms apply to the website, web app, account, groups, messages, notifications, and any future mobile apps.",
          "Reference the privacy policy and community or safety rules as part of the agreement.",
          "Explain that people who do not agree should not use the service.",
        ],
      },
      {
        id: "eligibility",
        heading: "2. Eligibility",
        body: "TeamForge is built for adults who can safely take part in real-world group activities.",
        bullets: [
          "Users must be at least 18 years old.",
          "Users must be allowed to use the service under applicable law.",
          "TeamForge may refuse, suspend, or close accounts that do not meet eligibility requirements.",
        ],
      },
      {
        id: "accounts",
        heading: "3. Accounts and security",
        body: "The terms should set expectations for accurate accounts and safe credential handling.",
        bullets: [
          "Provide accurate account and profile information.",
          "Keep passwords and sessions secure.",
          "Do not share accounts, impersonate someone else, or create accounts to avoid enforcement.",
          "Tell TeamForge quickly if an account or session may be compromised.",
        ],
      },
      {
        id: "profile-content",
        heading: "4. Profile and user content",
        body: "Users keep ownership of what they provide, but TeamForge needs permission to operate the service.",
        bullets: [
          "User content may include profiles, avatars, interests, group descriptions, messages, plans, ratings, reports, attachments, and feedback.",
          "Users must have the rights to content they upload or share.",
          "Users grant TeamForge a license to host, display, process, and use content to provide, protect, and improve the service.",
          "TeamForge may remove content that violates the terms, safety rules, law, or another person's rights.",
        ],
      },
      {
        id: "groups",
        heading: "5. Groups, plans, and invitations",
        body: "The terms should explain what TeamForge does and does not promise about group formation.",
        bullets: [
          "TeamForge may suggest or form groups using profile, interest, activity, and trust signals.",
          "A group suggestion does not guarantee friendship, attendance, compatibility, availability, or safety.",
          "Users are responsible for deciding whether to join, invite, attend, or continue with a plan.",
          "Group hosts and members should keep plans clear, lawful, respectful, and realistic.",
        ],
      },
      {
        id: "real-world-safety",
        heading: "6. Real-world activity and safety",
        body: "Because TeamForge supports offline activity, safety expectations should be explicit.",
        bullets: [
          "Meet in public or appropriate places when possible and use personal judgment.",
          "Do not pressure people to share private details, travel, spend money, drink, or attend unsafe plans.",
          "Users are responsible for their own conduct and decisions during real-world activities.",
          "TeamForge may provide safety tools, but it does not supervise or control offline events.",
        ],
      },
      {
        id: "acceptable-use",
        heading: "7. Acceptable use",
        body: "The terms should list behavior that is not allowed in the app.",
        bullets: [
          "No harassment, threats, hate, sexual exploitation, stalking, doxxing, impersonation, or non-consensual content.",
          "No spam, scams, scraping, bots, fake engagement, malware, reverse engineering, or attempts to bypass security.",
          "No illegal goods, weapons coordination, fraud, self-harm encouragement, or unsafe plans.",
          "No using TeamForge to discriminate, exclude, or target people based on protected characteristics.",
        ],
      },
      {
        id: "moderation",
        heading: "8. Trust and safety actions",
        body: "TeamForge should reserve the ability to act when users or groups create risk.",
        bullets: [
          "TeamForge may review reports, remove content, limit features, decline group formation, cancel invites, suspend accounts, or ban users.",
          "Safety decisions may use automated signals, human review, or both.",
          "Users can block, report, leave groups, and request help through available tools.",
          "TeamForge may preserve records when needed to investigate harm, enforce rules, or comply with law.",
        ],
      },
      {
        id: "ratings",
        heading: "9. Ratings and trust signals",
        body: "The terms should explain that trust and rating features are part of the service but not perfect measures of a person.",
        bullets: [
          "Ratings should be honest, respectful, and based on actual group participation.",
          "Do not manipulate ratings, retaliate, coordinate fake reports, or pressure people for positive feedback.",
          "Trust signals may affect future recommendations, invites, group formation, or safety review.",
          "TeamForge may hide, adjust, or remove ratings that look abusive or unreliable.",
        ],
      },
      {
        id: "third-party",
        heading: "10. Third-party services and links",
        body: "The terms should clarify that connected services have their own rules.",
        bullets: [
          "Google OAuth, maps, analytics, hosting, email, notifications, and external links may be governed by separate terms.",
          "TeamForge is not responsible for third-party sites, venues, events, transit, payment tools, or services users choose outside the app.",
          "Users should review third-party terms and privacy notices before relying on them.",
        ],
      },
      {
        id: "payments",
        heading: "11. Payments and paid features",
        body: "Even if TeamForge has no paid features today, the terms should explain the current state and leave room for future plans.",
        bullets: [
          "State whether TeamForge currently charges fees.",
          "If paid features are added later, describe billing, renewals, taxes, cancellations, trials, and refunds before charging users.",
          "Clarify that users are responsible for costs they agree to in group plans outside TeamForge.",
        ],
      },
      {
        id: "ip",
        heading: "12. TeamForge intellectual property",
        body: "The terms should protect the brand, software, designs, and product experience.",
        bullets: [
          "TeamForge owns the app, brand, logo, interface, software, design system, and non-user content.",
          "Users receive a limited, revocable, non-transferable right to use the service as intended.",
          "Users may not copy, sell, resell, exploit, or misuse TeamForge materials.",
        ],
      },
      {
        id: "availability",
        heading: "13. Changes, availability, and beta features",
        body: "The service will evolve, and the terms should say how changes are handled.",
        bullets: [
          "TeamForge may add, change, pause, or remove features.",
          "The service may be unavailable because of maintenance, incidents, providers, or security work.",
          "Experimental features, recommendations, and compatibility tools may change or be inaccurate.",
        ],
      },
      {
        id: "termination",
        heading: "14. Suspension and termination",
        body: "The terms should explain how accounts can end.",
        bullets: [
          "Users may stop using TeamForge or request account deletion.",
          "TeamForge may suspend or terminate access for violations, risk, legal reasons, or prolonged misuse.",
          "Some terms should continue after termination, including safety records, content licenses needed to operate past group history, disclaimers, and liability limits.",
        ],
      },
      {
        id: "disclaimers",
        heading: "15. Disclaimers and limits",
        body: "The terms should be clear about what TeamForge cannot guarantee.",
        bullets: [
          "TeamForge does not guarantee compatibility, safety, attendance, availability, outcomes, or error-free service.",
          "The service is provided as available, subject to limits allowed by law.",
          "Liability limits, damages exclusions, and consumer-rights carveouts should be finalized by counsel.",
        ],
      },
      {
        id: "disputes",
        heading: "16. Governing law and disputes",
        body: "This section needs jurisdiction-specific legal review before launch.",
        bullets: [
          "Name the governing law and venue or dispute process.",
          "Explain any arbitration, class-action waiver, informal resolution period, or small-claims carveout if used.",
          "Make sure consumer protection rights that cannot be waived remain intact.",
        ],
      },
      {
        id: "changes-contact",
        heading: "17. Changes and contact",
        body: "The terms should close with maintenance expectations and contact information.",
        bullets: [
          "Post updates on this page with a new effective date.",
          "Notify users of material changes when required or when changes meaningfully affect them.",
          "List the official legal contact, company address, and support path once finalized.",
        ],
      },
    ],
  },
};

export function LegalPage({ kind }: LegalPageProps) {
  const copy = legalPageCopy[kind];
  const alternate = kind === "privacy" ? "terms" : "privacy";
  const alternateCopy = legalPageCopy[alternate];

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="Back to TeamForge"
            className="inline-flex min-w-0 items-center gap-2 rounded-xl font-black text-ink transition-colors hover:text-forge-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35"
          >
            <TeamForgeLogo className="size-8" showBackground={false} />
            <span>TeamForge</span>
          </Link>

          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back home
            </Link>
          </Button>
        </header>

        <section className="py-14 sm:py-18">
          <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <LegalBadge kind={kind} />
                <p className="font-black text-slate-muted text-xs uppercase tracking-widest">
                  Updated {copy.updatedAt}
                </p>
              </div>

              <h1 className="mt-4 max-w-4xl text-balance font-black text-4xl leading-none tracking-tight sm:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-5 max-w-3xl font-medium text-base text-slate-muted leading-relaxed sm:text-lg">
                {copy.summary}
              </p>

              <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-spark-amber/25 bg-spark-amber/8 p-4">
                <BadgeCheck
                  className="mt-0.5 size-4 shrink-0 text-spark-amber"
                  aria-hidden="true"
                />
                <p className="font-semibold text-ink/80 text-sm leading-relaxed">
                  {copy.notice}
                </p>
              </div>
            </div>

            <aside className="rounded-2xl border border-border/70 bg-card/55 p-4 lg:sticky lg:top-6">
              <p className="font-black text-slate-muted text-xs uppercase tracking-widest">
                On this page
              </p>
              <nav
                aria-label={`${copy.eyebrow} sections`}
                className="mt-3 grid max-h-48 gap-1 overflow-y-auto pr-1"
              >
                {copy.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-lg px-2 py-1.5 font-semibold text-slate-muted text-xs leading-snug transition-colors hover:bg-muted/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {section.heading}
                  </a>
                ))}
              </nav>

              <div className="mt-4 border-border/70 border-t pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={alternate === "privacy" ? "/privacy" : "/terms"}>
                    {alternateCopy.eyebrow}
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </section>

        <div className="grid gap-4 border-border/70 border-t pb-16">
          {copy.sections.map((section) => (
            <LegalSectionBlock key={section.id} section={section} />
          ))}
        </div>
      </div>
    </main>
  );
}

function LegalBadge({ kind }: { kind: LegalPageKind }) {
  const Icon = kind === "privacy" ? ShieldCheck : Scale;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 py-1 font-black text-forge-teal text-xs uppercase tracking-widest">
      <Icon className="size-3.5" aria-hidden="true" />
      {kind === "privacy" ? "Privacy" : "Terms"}
    </span>
  );
}

function LegalSectionBlock({ section }: { section: LegalSection }) {
  return (
    <section
      id={section.id}
      className="grid scroll-mt-24 gap-4 border-border/70 border-b py-7 lg:grid-cols-3"
    >
      <div className="flex min-w-0 gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-forge-teal/10 text-forge-teal">
          <FileText className="size-4" aria-hidden="true" />
        </span>
        <h2 className="text-balance font-black text-ink text-xl leading-tight">
          {section.heading}
        </h2>
      </div>

      <div className="grid gap-4 lg:col-span-2">
        <p className="font-medium text-base text-slate-muted leading-relaxed">
          {section.body}
        </p>
        <ul className="grid gap-2">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2.5">
              <LockKeyhole
                className="mt-1 size-3.5 shrink-0 text-forge-teal"
                aria-hidden="true"
              />
              <span className="font-medium text-ink/82 text-sm leading-relaxed">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
