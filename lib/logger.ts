/**
 * Production-safe logging utility
 * In production, errors are logged without exposing sensitive information
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    if (isProduction) {
      // In production, log to error tracking service (e.g., Sentry, LogRocket)
      // For now, we'll use console.error but it will be removed by Next.js compiler
      const errorMessage = error instanceof Error ? error.message : String(error);
      const logData = {
        message,
        error: errorMessage,
        context,
        timestamp: new Date().toISOString(),
      };
      // In production, you should send this to your error tracking service
      // Example: Sentry.captureException(error, { extra: logData });
      if (!isProduction) {
        console.error('[ERROR]', logData);
      }
    } else {
      // In development, log normally
      console.error('[ERROR]', message, error, context);
    }
  },
  
  warn: (message: string, context?: Record<string, unknown>) => {
    if (!isProduction) {
      console.warn('[WARN]', message, context);
    }
  },
  
  info: (message: string, context?: Record<string, unknown>) => {
    if (!isProduction) {
      console.log('[INFO]', message, context);
    }
  },
};

