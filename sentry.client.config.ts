// UAFSAIDA — Sentry Configuration (Browser)
// Optional: only loads if @sentry/nextjs is installed and DSN is configured

let Sentry: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require('@sentry/nextjs');
  
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const integrations: any[] = [];
    
    // Try to add browser tracing if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { browserTracingIntegration } = require('@sentry/nextjs');
      if (browserTracingIntegration) {
        integrations.push(browserTracingIntegration({
          tracePropagationTargets: ['localhost', /^https:\/\/uafsaida\.vercel\.app/],
        }));
      }
    } catch {
      // Browser tracing not available
    }

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations,
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
