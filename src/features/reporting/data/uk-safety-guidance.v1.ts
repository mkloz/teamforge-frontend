import type { ReportCategory } from "@/features/reporting/schemas/report.schemas";

export interface SafetyGuidanceAction {
  href: string;
  label: string;
}

export interface SafetyGuidanceItem {
  actions?: readonly SafetyGuidanceAction[];
  text: string;
}

export const UK_SAFETY_GUIDANCE_DIRECTORY = {
  version: "2026-07-15.v1",
  effectiveOn: "2026-07-15",
  reviewAfter: "2027-01-15",
  sources: [
    {
      name: "GOV.UK: Contact the police",
      url: "https://www.gov.uk/contact-police",
    },
    {
      name: "GOV.UK: 999 and 112",
      url: "https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers",
    },
    {
      name: "NHS: Urgent mental health help",
      url: "https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/",
    },
    {
      name: "CEOP reporting",
      url: "https://www.ceop.police.uk/ceop-reporting",
    },
    {
      name: "Childline: Get support",
      url: "https://www.childline.org.uk/get-support/",
    },
    {
      name: "NSPCC Helpline",
      url: "https://www.nspcc.org.uk/about-us/our-services/nspcc-helpline/",
    },
  ],
} as const;

const EMERGENCY_GUIDANCE: SafetyGuidanceItem = {
  text: "If someone is in immediate danger or a crime is happening now, call 999 or 112.",
  actions: [
    { href: "tel:999", label: "Call 999" },
    {
      href: "https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers",
      label: "Read GOV.UK guidance",
    },
  ],
};

const NON_EMERGENCY_POLICE_GUIDANCE: SafetyGuidanceItem = {
  text: "For a non-emergency police matter, call 101.",
  actions: [
    { href: "tel:101", label: "Call 101" },
    {
      href: "https://www.gov.uk/contact-police",
      label: "Contact the police online",
    },
  ],
};

const GUIDANCE_BY_CATEGORY: Partial<
  Record<ReportCategory, readonly SafetyGuidanceItem[]>
> = {
  THREAT_OR_VIOLENCE: [EMERGENCY_GUIDANCE, NON_EMERGENCY_POLICE_GUIDANCE],
  STALKING_OR_PRIVACY: [EMERGENCY_GUIDANCE, NON_EMERGENCY_POLICE_GUIDANCE],
  SELF_HARM_CONCERN: [
    {
      text: "If there is an immediate risk to life, call 999 or go to A&E.",
      actions: [{ href: "tel:999", label: "Call 999" }],
    },
    {
      text: "In England, call NHS 111 for urgent mental health help.",
      actions: [
        { href: "tel:111", label: "Call 111" },
        {
          href: "https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/",
          label: "Read NHS guidance",
        },
      ],
    },
  ],
  UNDERAGE_SAFETY: [
    {
      text: "If a child is in immediate danger, call 999 or 112.",
      actions: [{ href: "tel:999", label: "Call 999" }],
    },
    {
      text: "CEOP accepts reports about online child sexual abuse or grooming.",
      actions: [
        {
          href: "https://www.ceop.police.uk/ceop-reporting",
          label: "Make a CEOP report",
        },
      ],
    },
    {
      text: "A child can contact Childline. An adult concerned about a child can contact the NSPCC Helpline.",
      actions: [
        { href: "tel:08001111", label: "Call Childline: 0800 1111" },
        {
          href: "tel:08088005000",
          label: "Call NSPCC: 0808 800 5000",
        },
      ],
    },
  ],
};

export function getSafetyGuidance(
  category: ReportCategory | undefined,
  immediateSafety: boolean,
) {
  if (category && GUIDANCE_BY_CATEGORY[category]) {
    return GUIDANCE_BY_CATEGORY[category] ?? [];
  }

  return immediateSafety ? [EMERGENCY_GUIDANCE] : [];
}
