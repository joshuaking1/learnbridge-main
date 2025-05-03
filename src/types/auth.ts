export interface User {
    id: string;
    email: string;
    firstName: string;
    role: string;
}

export interface LoginResponse {
    token?: string;
    requires2FA?: boolean;
    tempToken?: string;
    user?: User;
    message: string;
}

export interface TwoFactorVerifyResponse {
    token: string;
    user: User;
    message: string;
}