import type { User, LoginResponse, TwoFactorVerifyResponse } from '@/types/shared';

/**
 * Normalizes a user object from the API response to match our internal User type
 */
export function normalizeUser(apiUser: LoginResponse['user'] | TwoFactorVerifyResponse['user']): User {
    if (!apiUser) {
        throw new Error('User data is missing from response');
    }

    return {
        id: typeof apiUser.id === 'string' ? parseInt(apiUser.id) : apiUser.id,
        email: apiUser.email,
        firstName: apiUser.firstName || apiUser.first_name,
        role: apiUser.role,
        // Optional fields
        ...(apiUser.surname && { surname: apiUser.surname }),
        ...(apiUser.school && { school: apiUser.school }),
        ...(apiUser.location && { location: apiUser.location }),
        ...(apiUser.phone && { phone: apiUser.phone }),
        ...(apiUser.gender && { gender: apiUser.gender }),
        ...(apiUser.profile_image_url && { profile_image_url: apiUser.profile_image_url }),
    };
}

/**
 * Type guard to check if a response is a TwoFactorVerifyResponse
 */
export function isTwoFactorVerifyResponse(
    response: LoginResponse | TwoFactorVerifyResponse
): response is TwoFactorVerifyResponse {
    return 'token' in response && !('requires2FA' in response);
}

/**
 * Transforms error responses into a consistent format
 */
export function handleAuthError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

/**
 * Validates that a login response contains the necessary data
 */
export function validateLoginResponse(response: LoginResponse): boolean {
    if (response.requires2FA) {
        return !!response.tempToken && !!response.user;
    }
    return !!response.token && !!response.user;
}