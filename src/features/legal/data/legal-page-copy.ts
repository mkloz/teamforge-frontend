import type {
  LegalPageCopy,
  LegalPageKind,
} from "@/features/legal/types/legal-page";

export const legalPageCopy: Record<LegalPageKind, LegalPageCopy> = {
  privacy: {
    eyebrow: "Privacy policy",
    title: "How TeamForge handles your data",
    updatedAt: "May 16, 2026",
    summary:
      "TeamForge uses profile, personality, interests, social graph, group, safety, and activity signals to form small compatible groups and keep the service reliable.",
    notice:
      "This page describes the product behavior currently supported by TeamForge. When the service changes in a meaningful way, this policy will be updated with a new effective date.",
    sections: [
      {
        id: "scope",
        heading: "1. Scope",
        body: "This policy covers TeamForge accounts, the web app, group formation, direct messages, group chats, notifications, settings, and the public website.",
        bullets: [
          "TeamForge is responsible for the personal information it collects through the service.",
          "People can use this policy to understand what data powers profile setup, group suggestions, planning, chat, and trust features.",
          "Account, privacy, safety, or deletion requests can be made from the email tied to the TeamForge account whenever possible.",
        ],
      },
      {
        id: "data-collected",
        heading: "2. Information we collect",
        body: "TeamForge collects the information needed to create an account, describe a person accurately, form groups, operate chats, and keep the platform trustworthy.",
        bullets: [
          "Account data: name, email, password credentials, authentication provider, account status, verification state, and session metadata.",
          "Profile data: avatar, bio, age, gender, city, personality type, OCEAN scores, interests, trust score, and profile visibility choices.",
          "Group and plan data: groups, members, roles, invites, join requests, plans, proposals, votes, ratings, attendance context, and participation signals.",
          "Chat data: messages, replies, forwarded messages, attachments, reactions, pinned messages, saved messages, read state, link previews, blocks, and reports.",
          "Technical data: device, browser, IP-derived region, logs, performance data, error details, security events, and approximate usage patterns.",
        ],
      },
      {
        id: "inferred-data",
        heading: "3. Inferred and sensitive signals",
        body: "Some TeamForge signals can feel personal even when they are used only to make the app easier and safer to use.",
        bullets: [
          "Personality answers are used to infer a personality type and OCEAN profile.",
          "Interest, social graph, and trust signals may be used to infer likely compatibility with groups or people.",
          "Location is used at city or plan level unless a precise meeting place is needed for a confirmed plan.",
          "TeamForge does not require government ID, financial data, health data, or exact live location for core account use.",
        ],
      },
      {
        id: "use",
        heading: "4. How we use information",
        body: "TeamForge uses information to provide the product, protect people, and make group formation feel intentional instead of random.",
        bullets: [
          "Create, verify, secure, recover, and maintain accounts.",
          "Recommend groups, rank compatibility, form groups, manage invitations, and support planning decisions.",
          "Operate chats, notifications, profile controls, settings, media handling, search, and safety tools.",
          "Detect abuse, spam, fake accounts, harassment, unsafe plans, and behavior that harms trust.",
          "Improve reliability, debug errors, measure product health, and understand which flows need refinement.",
        ],
      },
      {
        id: "visibility",
        heading: "5. What other people can see",
        body: "TeamForge is a social product, so some information becomes visible when people browse, join, or participate in groups.",
        bullets: [
          "Profile visibility may include name, avatar, bio, city, personality type, interests, trust indicators, and mutual group context.",
          "Group members can see group plans, participants, roles, messages, proposals, votes, pinned content, and relevant activity.",
          "Invite, request, block, mute, read, and message state may be visible when needed to operate the product.",
          "Private credentials, internal safety notes, raw scoring inputs, and account security details are not shown to other users.",
        ],
      },
      {
        id: "providers",
        heading: "6. Service providers and third parties",
        body: "TeamForge uses trusted service providers to host, secure, measure, and operate the app.",
        bullets: [
          "Providers may support hosting, database, storage, monitoring, analytics, email, notifications, authentication, maps, media, and anti-abuse work.",
          "Google services may be used for OAuth or address autocomplete when configured.",
          "External links, GIFs, and link previews may contact third-party services when users interact with shared content.",
          "TeamForge does not sell personal information.",
        ],
      },
      {
        id: "retention",
        heading: "7. Retention and deletion",
        body: "TeamForge keeps information only for as long as it is useful for account operation, safety, legal obligations, dispute handling, or product reliability.",
        bullets: [
          "Account and profile data are kept while the account is active.",
          "Messages, group plans, invites, ratings, and safety records may remain where needed to preserve group history or investigate abuse.",
          "Deleted accounts remove or de-identify personal profile surfaces where practical, while some records may remain for security, legal, backup, or integrity reasons.",
          "Logs and backups may take additional time to expire through normal retention cycles.",
        ],
      },
      {
        id: "security",
        heading: "8. Security",
        body: "TeamForge uses practical safeguards to reduce risk, but no online service can promise perfect security.",
        bullets: [
          "Authentication, access controls, token refresh, encrypted transport, logging, and operational safeguards protect account access.",
          "Access to personal data is limited to people and systems that need it to operate, secure, or improve the service.",
          "Users are expected to keep passwords private, review active sessions, verify email, and report suspicious activity quickly.",
          "Security incidents are handled according to their severity and applicable obligations.",
        ],
      },
      {
        id: "choices",
        heading: "9. Choices and rights",
        body: "People can adjust many privacy and matching controls directly in TeamForge, and may also have legal privacy rights depending on location.",
        bullets: [
          "Users can update profile details, avatar, interests, personality answers, matching preferences, notifications, privacy settings, blocks, and sessions.",
          "Where available by law, users may request access, correction, deletion, export, restriction, objection, or withdrawal of consent.",
          "TeamForge may verify requests and may limit a request when needed for safety, fraud prevention, legal compliance, or another person's privacy.",
          "TeamForge is for people 18 and older and does not knowingly collect information from minors.",
        ],
      },
      {
        id: "changes",
        heading: "10. Changes and contact",
        body: "TeamForge will keep this policy current as the product and its providers evolve.",
        bullets: [
          "Updates will be posted on this page with a new effective date.",
          "Material changes may also be communicated in the app or by email when appropriate.",
          "Privacy, account, or safety requests need enough detail to identify the account and the request.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms of service",
    title: "The rules for using TeamForge",
    updatedAt: "May 16, 2026",
    summary:
      "TeamForge helps people form small groups for real-world activities. These terms explain account responsibilities, group behavior, content rules, safety expectations, and platform limits.",
    notice:
      "By using TeamForge, you agree to use the service responsibly and follow these terms. If you do not agree, do not create an account or use the app.",
    sections: [
      {
        id: "agreement",
        heading: "1. Agreement",
        body: "These terms apply to the TeamForge website, web app, account, groups, messages, notifications, and related product experiences.",
        bullets: [
          "The privacy policy explains how TeamForge handles personal information.",
          "Additional product rules or safety notices may apply to specific features.",
          "If a feature shows more specific rules, those rules apply to that feature.",
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
        body: "Users are responsible for keeping their TeamForge account accurate and secure.",
        bullets: [
          "Provide accurate account and profile information.",
          "Keep passwords and sessions secure.",
          "Do not share accounts, impersonate someone else, or create accounts to avoid enforcement.",
          "Tell TeamForge quickly if an account or session may be compromised.",
        ],
      },
      {
        id: "content",
        heading: "4. Profile and user content",
        body: "Users keep ownership of what they provide, while giving TeamForge the permission needed to operate the product.",
        bullets: [
          "User content may include profiles, avatars, interests, group descriptions, messages, plans, ratings, reports, attachments, and feedback.",
          "Users must have the rights to content they upload or share.",
          "TeamForge may host, display, process, and use content to provide, protect, and improve the service.",
          "TeamForge may remove content that violates these terms, safety rules, law, or another person's rights.",
        ],
      },
      {
        id: "groups",
        heading: "5. Groups, plans, and invitations",
        body: "TeamForge helps form and coordinate groups, but each person remains responsible for their decisions and conduct.",
        bullets: [
          "TeamForge may suggest or form groups using profile, interest, activity, and trust signals.",
          "A group suggestion does not guarantee friendship, attendance, compatibility, availability, or safety.",
          "Users are responsible for deciding whether to join, invite, attend, or continue with a plan.",
          "Group hosts and members must keep plans clear, lawful, respectful, and realistic.",
        ],
      },
      {
        id: "safety",
        heading: "6. Real-world activity and safety",
        body: "Because TeamForge supports offline activity, users must apply real-world judgment.",
        bullets: [
          "Meet in public or appropriate places when possible.",
          "Do not pressure people to share private details, travel, spend money, drink, or attend unsafe plans.",
          "Users are responsible for their own conduct and decisions during real-world activities.",
          "TeamForge may provide safety tools, but it does not supervise or control offline events.",
        ],
      },
      {
        id: "acceptable-use",
        heading: "7. Acceptable use",
        body: "TeamForge must stay useful, respectful, and safe for people forming groups.",
        bullets: [
          "No harassment, threats, hate, sexual exploitation, stalking, doxxing, impersonation, or non-consensual content.",
          "No spam, scams, scraping, bots, fake engagement, malware, reverse engineering, or attempts to bypass security.",
          "No illegal goods, fraud, unsafe coordination, self-harm encouragement, or plans that create unreasonable risk.",
          "No using TeamForge to discriminate, exclude, or target people based on protected characteristics.",
        ],
      },
      {
        id: "moderation",
        heading: "8. Trust and safety actions",
        body: "TeamForge may act when users, content, groups, or plans create risk.",
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
        body: "Trust features help TeamForge keep groups reliable, but they are not perfect measures of a person.",
        bullets: [
          "Ratings must be honest, respectful, and based on actual group participation.",
          "Do not manipulate ratings, retaliate, coordinate fake reports, or pressure people for positive feedback.",
          "Trust signals may affect future recommendations, invites, group formation, or safety review.",
          "TeamForge may hide, adjust, or remove ratings that look abusive or unreliable.",
        ],
      },
      {
        id: "third-party",
        heading: "10. Third-party services and links",
        body: "Some parts of TeamForge rely on providers or links outside the app.",
        bullets: [
          "OAuth, maps, analytics, hosting, email, notifications, media, and external links may be governed by separate terms.",
          "TeamForge is not responsible for third-party sites, venues, events, transit, payment tools, or services users choose outside the app.",
          "Users are responsible for reviewing third-party terms and privacy notices before relying on them.",
        ],
      },
      {
        id: "payments",
        heading: "11. Payments and costs",
        body: "TeamForge does not currently charge users for core access to the app.",
        bullets: [
          "If paid features are added later, pricing and billing rules will be shown before charging users.",
          "Users are responsible for costs they agree to in group plans outside TeamForge, such as tickets, food, travel, venue fees, or equipment.",
          "TeamForge is not a payment processor for costs arranged between group members unless a future feature clearly says otherwise.",
        ],
      },
      {
        id: "ip",
        heading: "12. TeamForge intellectual property",
        body: "TeamForge owns the product experience it provides.",
        bullets: [
          "TeamForge owns the app, brand, logo, interface, software, design system, and non-user content.",
          "Users receive a limited, revocable, non-transferable right to use the service as intended.",
          "Users may not copy, sell, resell, exploit, or misuse TeamForge materials.",
        ],
      },
      {
        id: "availability",
        heading: "13. Availability and changes",
        body: "The service will evolve and may not always be available.",
        bullets: [
          "TeamForge may add, change, pause, or remove features.",
          "The service may be unavailable because of maintenance, incidents, providers, or security work.",
          "Experimental features, recommendations, and compatibility tools may change or be inaccurate.",
        ],
      },
      {
        id: "termination",
        heading: "14. Suspension and termination",
        body: "Accounts can end by user choice or by TeamForge action when needed.",
        bullets: [
          "Users may stop using TeamForge or request account deletion.",
          "TeamForge may suspend or terminate access for violations, risk, legal reasons, or prolonged misuse.",
          "Some terms continue after termination, including safety records, content licenses needed to operate past group history, disclaimers, and liability limits.",
        ],
      },
      {
        id: "limits",
        heading: "15. Disclaimers, limits, and contact",
        body: "TeamForge aims to be reliable and useful, but it cannot guarantee every outcome.",
        bullets: [
          "TeamForge does not guarantee compatibility, safety, attendance, availability, outcomes, or error-free service.",
          "The service is provided as available, subject to limits allowed by law.",
          "If a law gives a user rights that cannot be waived, those rights remain in place.",
          "Questions or account requests need enough detail to identify the account and the issue.",
        ],
      },
    ],
  },
};
