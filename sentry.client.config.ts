// UAFSAIDA — Sentry Configuration (Browser)
// @ts-ignore - sentry package optional
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new (Sentry as any).BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/uafsaida\.vercel\.app/],
    }),
    new (Sentry as any).Replay(),
  ],
  beforeSend(event: any) {
    if (event.exception?.values?.[0]?.type === 'AuthenticationError') {
      return null;
    }
    return event;
  },
});
