import { useState } from "react";

export function useSettingsSecurityActionState() {
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );

  return {
    revokingSessionId,
    securityError,
    setRevokingSessionId,
    setSecurityError,
  };
}
