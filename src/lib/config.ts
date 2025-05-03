export const config = {
    apiBaseUrl: 'https://learnbridge-auth-service.onrender.com', // Auth service URL
    appName: 'LearnBridge',
    auth: {
        tokenKey: 'auth_token',
        tokenPrefix: 'Bearer',
    }
} as const;