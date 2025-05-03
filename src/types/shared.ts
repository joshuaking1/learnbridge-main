/**
 * Shared types used across the application
 */

// User interface for the authentication store and API responses
export interface User {
    id: number;
    email: string;
    first_name?: string;
    firstName?: string;
    surname?: string;
    role: string;
    school?: string;
    location?: string;
    phone?: string;
    gender?: string;
    profile_image_url?: string;
}

// API Response interfaces
export interface ApiResponse<T = unknown> {
    message: string;
    data?: T;
    error?: string;
}

export interface LoginResponse extends ApiResponse {
    token?: string;
    requires2FA?: boolean;
    tempToken?: string;
    user?: User;
}

export interface TwoFactorVerifyResponse extends ApiResponse {
    token: string;
    user: User;
}

// API Error response
export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}

export class ApiResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApiResponseError';
    }
}