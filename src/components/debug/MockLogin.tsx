"use client";

import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';

export function MockLogin() {
    const { setUserAndToken } = useAuthStore();

    const handleMockLogin = () => {
        // Create a mock user with first_name
        const mockUser = {
            id: 1,
            email: "test@example.com",
            first_name: "John",
            surname: "Doe",
            role: "teacher",
            email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Set the mock user and a fake token
        setUserAndToken(mockUser, "mock-token-123");
        console.log("Mock login completed with user:", mockUser);
    };

    return (
        <div className="p-4 bg-yellow-100 rounded-md">
            <h3 className="font-bold mb-2">Debug Tools</h3>
            <Button 
                onClick={handleMockLogin}
                className="bg-blue-500 hover:bg-blue-600 text-white"
            >
                Set Mock User Data
            </Button>
            <p className="text-xs mt-2">
                This will set a mock user with the name "John Doe"
            </p>
        </div>
    );
}
