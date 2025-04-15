import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Utility function to debug authentication state
 * Call this from the browser console to check auth state
 */
export function debugAuthState() {
  const state = useAuthStore.getState();
  console.log('=== AUTH STATE DEBUG ===');
  console.log('Loading:', state.isLoading);
  console.log('Authenticated:', state.isAuthenticated);
  console.log('User:', state.user);
  console.log('Token exists:', !!state.token);
  console.log('=======================');

  // Check localStorage directly
  try {
    const storedAuth = localStorage.getItem('auth-storage');
    console.log('Raw localStorage data:', storedAuth);

    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      console.log('Parsed localStorage data:', parsed);
    }
  } catch (error) {
    console.error('Error reading localStorage:', error);
  }

  return state;
}

/**
 * Force reset the authentication state
 * Call this from the browser console to reset auth state
 */
export function resetAuthState() {
  const state = useAuthStore.getState();
  state.clearAuth();
  console.log('Auth state has been reset');
  return useAuthStore.getState();
}

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
      console.warn('Token has expired');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
}

// Make these functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuthState;
  (window as any).resetAuth = resetAuthState;
  (window as any).isTokenValid = isTokenValid;
}