const RECENT_ACTIVITY_TEMPLATE_PREFIX = "recent:";

export function getRecentActivityTemplateId(activityId: string) {
  return `${RECENT_ACTIVITY_TEMPLATE_PREFIX}${activityId}`;
}

export function isRecentActivityTemplateId(
  templateId: string | null | undefined,
) {
  return templateId?.startsWith(RECENT_ACTIVITY_TEMPLATE_PREFIX) ?? false;
}
