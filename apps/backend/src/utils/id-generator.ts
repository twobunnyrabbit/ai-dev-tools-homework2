import { randomBytes } from 'crypto';

/**
 * Generate a unique session ID using crypto.randomBytes
 * @returns A URL-safe random string
 */
export function generateSessionId(): string {
  return randomBytes(16).toString('base64url');
}

/**
 * Generate a unique user ID
 * @returns A URL-safe random string
 */
export function generateUserId(): string {
  return randomBytes(12).toString('base64url');
}
