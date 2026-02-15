import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN,

		// Adjust sample rate for production
		tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

		// Environment detection
		environment: process.env.NODE_ENV || 'development',

		// Enable debug in development
		debug: process.env.NODE_ENV === 'development',
	});
}
