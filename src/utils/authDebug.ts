import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Check if the token is valid and not expired
 * This is a simple check that doesn't validate the signature
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));

    // Check if token has expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}