import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('[2FA Initialize API Route] Request received');
  
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log('[2FA Initialize API Route] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('[2FA Initialize API Route] Missing authorization header');
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Forward the request to the auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
    console.log(`[2FA Initialize API Route] Forwarding request to ${authServiceUrl}/api/auth/2fa/initialize`);

    try {
      const response = await fetch(`${authServiceUrl}/api/auth/2fa/initialize`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      console.log(`[2FA Initialize API Route] Auth service response status:`, response.status);
      
      // Get the response data
      const data = await response.json();
      console.log('[2FA Initialize API Route] Auth service response data:', data);

      // Return the response from the auth service
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError) {
      console.error('[2FA Initialize API Route] Fetch error:', fetchError.message);
      return NextResponse.json(
        { error: `Failed to connect to auth service: ${fetchError.message}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('[2FA Initialize API Route] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize two-factor authentication' },
      { status: 500 }
    );
  }
}