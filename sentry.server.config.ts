// UAFSAIDA — Sentry Configuration (Server)
// Optional: only loads if @sentry/nextjs is installed and DSN is configured

let Sentry: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require('@sentry/nextjs');
  
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event: any) {
        if (event.exception?.values?.[0]?.type === 'AuthenticationError') {
          return null;
        }
        return event;
      },
    });
  }
} catch {
  // Sentry not installed, skip initialization
  console.log('[Sentry] Optional package not installed, error tracking disabled');
}

export { Sentry };
