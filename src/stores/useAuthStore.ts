// frontend/src/stores/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // For persisting state to localStorage

// Define the User interface (can be shared or redefined here)
interface User {
    id: number;
    email: string;
    first_name?: string; // Snake case version
    firstName?: string; // Camel case version
    surname?: string; // Optional based on your needs/DB
    role: string;
    school?: string;
    location?: string;
    phone?: string;
    gender?: string;
    profile_image_url?: string;
    // Add other relevant fields from your user object
}

// Define the state structure and actions
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean; // To track initial loading from storage
    setUserAndToken: (user: User, token: string) => void;
    setUser: (user: User) => void; // Update user data only
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
    refreshToken: () => Promise<boolean>; // Add token refresh function
}

// Create the store using Zustand
// Use persist middleware to save/load state from localStorage
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Initial state
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true, // Start loading initially

            // Action to set user and token (e.g., after login)
            setUserAndToken: (user, token) => {
                set({ user, token, isAuthenticated: true, isLoading: false });
                // Auth state updated
            },

            // Action to update user data only (e.g., after profile update)
            setUser: (user) => {
                set({ user });
                // User data updated
            },

            // Action to clear user and token (e.g., after logout or auth error)
            clearAuth: () => {
                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                // Auth state cleared
            },

            // Action to manually control loading state if needed
            setLoading: (loading) => {
                // Setting loading state
                set({ isLoading: loading });
            },

            // Action to refresh the token
            refreshToken: async () => {
                const currentState = useAuthStore.getState();
                const currentUser = currentState.user;

                if (!currentUser || !currentUser.id) {
                    console.error('Cannot refresh token: No user found');
                    return false;
                }

                try {
                    // Call our Next.js API route to refresh the token
                    const response = await fetch('/api/auth/refresh-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            // Include the current token for verification
                            'Authorization': `Bearer ${currentState.token}`
                        },
                        body: JSON.stringify({ userId: currentUser.id })
                    });

                    if (!response.ok) {
                        console.error('Token refresh failed:', response.status);
                        // If refresh fails, clear auth state
                        currentState.clearAuth();
                        return false;
                    }

                    const data = await response.json();

                    if (data.token) {
                        // Update the token in the store
                        set({ token: data.token, isAuthenticated: true });
                        // Token refreshed successfully
                        return true;
                    } else {
                        console.error('Token refresh response missing token');
                        return false;
                    }
                } catch (error) {
                    console.error('Error refreshing token:', error);
                    return false;
                }
            },

        }),
        {
            name: 'auth-storage', // Name of the item in localStorage
            storage: createJSONStorage(() => localStorage), // Use localStorage
            // Only persist user and token, derive isAuthenticated on load
            partialize: (state) => ({ user: state.user, token: state.token }),
            // Rehydrate logic (runs once on load)
            onRehydrateStorage: () => {
                // Rehydrating auth state from storage
                return (state, error) => {
                    if (error) {
                        console.error('Failed to rehydrate auth state:', error);
                        state?.setLoading(false); // Stop loading even on error
                    } else if (state) {
                        // If token and user exist in storage, mark as authenticated
                        const isAuthenticated = !!state.token && !!state.user;
                        state.isAuthenticated = isAuthenticated;
                        // Rehydration complete
                    }
                    // Always finish initial loading after rehydration attempt
                    state?.setLoading(false);
                }
            }
        }
    )
);

// Optional: Initialize loading state check on first import (client-side only)
if (typeof window !== 'undefined') {
    // Set a timeout to ensure loading state is set to false even if rehydration fails
    setTimeout(() => {
        const currentState = useAuthStore.getState();
        if (currentState.isLoading) {
            // Forcing loading state to false after timeout
            currentState.setLoading(false);
        }
    }, 2000); // 2 second timeout
}