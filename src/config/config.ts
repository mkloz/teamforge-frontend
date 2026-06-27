interface Config {
  environment: string;
  isProduction: boolean;
  isDevelopment: boolean;
  appUrl?: string;
  apiUrl?: string;
  mediaBaseUrl?: string;
  googleClientId?: string;
  googleMapsApiKey?: string;
  giphyApiKey?: string;
  sentryDsn?: string;
  sentryEnvironment?: string;
  sentryRelease?: string;
  sentryTracesSampleRate?: string;
}
export const config: Config = {
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  appUrl: import.meta.env.VITE_APP_URL,
  apiUrl: import.meta.env.VITE_API_URL,
  mediaBaseUrl: import.meta.env.VITE_MEDIA_BASE_URL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  giphyApiKey: import.meta.env.VITE_GIPHY_API_KEY,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  sentryEnvironment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  sentryRelease: import.meta.env.VITE_SENTRY_RELEASE,
  sentryTracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
};
