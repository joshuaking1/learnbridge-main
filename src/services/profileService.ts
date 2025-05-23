// frontend/src/services/profileService.ts
import { USER_SERVICE_URL } from '@/config/serviceUrls';

/**
 * Service for handling profile-related API calls
 */
export const profileService = {
    /**
     * Fetch the complete user profile from the database
     * @param token JWT token for authentication
     * @returns User profile data
     */
    async fetchUserProfile(token: string) {
        if (!token) {
            throw new Error('Authentication token is required');
        }

        const response = await fetch(`${USER_SERVICE_URL}/api/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch user profile');
        }

        return await response.json();
    },

    /**
     * Upload a profile image
     * @param token JWT token for authentication
     * @param file Image file to upload
     * @returns Updated user data with profile image URL
     */
    async uploadProfileImage(token: string, file: File) {
        if (!token) {
            throw new Error('Authentication token is required');
        }

        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await fetch(`${USER_SERVICE_URL}/api/users/profile/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to upload profile image');
        }

        return await response.json();
    }
};
