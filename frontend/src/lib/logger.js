/**
 * Development-only logger utility.
 * In production builds, all logging calls become no-ops.
 * In development, they pass through to native console methods.
 *
 * Usage:
 *   import { devLog, devWarn, devError } from '@/lib/logger';
 *   devLog('message');          // Only logs in development
 *   devWarn('fallback active'); // Only warns in development
 *   devError('critical', err);  // Only errors in development
 */

const isDev = process.env.NODE_ENV !== 'production';

/** Log informational messages (development only) */
export const devLog = isDev
  ? (...args) => console.log(...args)
  : () => {};

/** Log warning messages (development only) */
export const devWarn = isDev
  ? (...args) => console.warn(...args)
  : () => {};

/** Log error messages (development only) */
export const devError = isDev
  ? (...args) => console.error(...args)
  : () => {};
