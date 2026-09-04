// UAFSAIDA — Sentry Instrumentation
// This file is automatically loaded by Next.js on server startup
// Errors here are caught silently to prevent app startup failure

export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('../sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('../sentry.edge.config');
    }
  } catch {
    // Sentry not configured or not installed - app still works
    console.log('[Instrumentation] Sentry not initialized');
  }
}
