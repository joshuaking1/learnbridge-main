/**
 * Utility functions for handling authentication tokens
 */

/**
 * Formats a token to ensure it has the proper Bearer prefix
 * This helps ensure consistent token formatting across the application
 * 
 * @param token The token to format (can be with or without Bearer prefix)
 * @returns A properly formatted token with Bearer prefix
 */
export function formatBearerToken(token: string): string {
  if (!token) return '';
  
  // Remove any existing Bearer prefix (case insensitive)
  const cleanToken = token.replace(/^bearer\s+/i, '');
  
  // Add the Bearer prefix
  return `Bearer ${cleanToken}`;
}

/**
 * Checks if a token is in valid JWT format
 * This is a simple structural check, not a cryptographic verification
 * 
 * @param token The token to check
 * @returns True if the token appears to be a valid JWT
 */
export function isValidJwtFormat(token: string): boolean {
  if (!token) return false;
  
  // Remove Bearer prefix if present
  const cleanToken = token.replace(/^bearer\s+/i, '');
  
  // JWT tokens have 3 parts separated by dots
  const parts = cleanToken.split('.');
  if (parts.length !== 3) return false;
  
  // Each part should be base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64UrlRegex.test(part));
}
