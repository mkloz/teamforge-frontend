interface Config {
  environment: string;
  isProduction: boolean;
  isDevelopment: boolean;
  appUrl?: string;
  apiUrl?: string;
  mediaBaseUrl?: string;
  googleClientId?: string;
  googleMapsApiKey?: string;
  googleStaticMapsEnabled: boolean;
  giphyApiKey?: string;
  calendarExportEnabled: boolean;
  sentryDsn?: string;
  sentryEnvironment?: string;
  sentryRelease?: string;
  sentryTracesSampleRate?: string;
}

const LOCAL_DEVELOPMENT_API_URL = "http://localhost:6969/api/v1";

export function resolveApiUrl(
  configuredApiUrl: string | undefined,
  isDevelopment: boolean,
) {
  const normalizedApiUrl = configuredApiUrl?.trim();

  if (normalizedApiUrl) {
    return normalizedApiUrl;
  }

  return isDevelopment ? LOCAL_DEVELOPMENT_API_URL : undefined;
}

export const config: Config = {
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  appUrl: import.meta.env.VITE_APP_URL,
  apiUrl: resolveApiUrl(import.meta.env.VITE_API_URL, import.meta.env.DEV),
  mediaBaseUrl: import.meta.env.VITE_MEDIA_BASE_URL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  googleStaticMapsEnabled:
    import.meta.env.VITE_GOOGLE_STATIC_MAPS_ENABLED === "true",
  giphyApiKey: import.meta.env.VITE_GIPHY_API_KEY,
  calendarExportEnabled:
    import.meta.env.VITE_CALENDAR_EXPORT_ENABLED === "true",
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  sentryEnvironment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  sentryRelease: import.meta.env.VITE_SENTRY_RELEASE,
  sentryTracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
};
