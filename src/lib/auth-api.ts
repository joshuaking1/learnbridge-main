import { config } from './config';
import { APIError } from '@/types/api';

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

class AuthAPI {
    private baseUrl: string;
    
    constructor() {
        this.baseUrl = config.apiBaseUrl;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        console.log(`[AuthAPI] Making request to endpoint: ${endpoint}`);
        const token = localStorage.getItem(config.auth.tokenKey);
        console.log(`[AuthAPI] Token present: ${!!token}`);
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `${config.auth.tokenPrefix} ${token}` }),
            ...options.headers,
        };
        
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`[AuthAPI] Full request URL: ${url}`);
        console.log(`[AuthAPI] Request method: ${options.method || 'GET'}`);
        console.log(`[AuthAPI] Request headers:`, headers);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });
            
            console.log(`[AuthAPI] Response status: ${response.status}`);
            
            const data = await response.json();
            console.log(`[AuthAPI] Response data:`, data);

            if (!response.ok) {
                console.error(`[AuthAPI] Request failed with status ${response.status}:`, data);
                const error = data as APIError;
                throw new Error(error.message || 'Request failed');
            }

            return data as T;
        } catch (error) {
            console.error(`[AuthAPI] Fetch error:`, error);
            throw error;
        }
    }

    async post<TResponse>(
        endpoint: string,
        data?: Record<string, unknown>
    ): Promise<TResponse> {
        return this.request<TResponse>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async get<TResponse>(endpoint: string): Promise<TResponse> {
        return this.request<TResponse>(endpoint, {
            method: 'GET',
        });
    }
}

export const authApi = new AuthAPI();