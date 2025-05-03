export interface APIError {
    message: string;
    code?: string;
    details?: unknown;
}

export interface TwoFactorInitResponse {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}

export interface TwoFactorEnableResponse {
    message: string;
}

export class APIResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'APIResponseError';
    }
}