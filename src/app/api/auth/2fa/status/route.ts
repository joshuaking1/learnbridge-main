import { NextRequest, NextResponse } from 'next/server';

// This is a proxy API route that forwards requests to the auth service
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      console.log('[API Route] Missing Authorization header');
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Forward the request to the auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
    console.log(`[API Route] Forwarding request to ${authServiceUrl}/api/auth/2fa/status`);

    const response = await fetch(`${authServiceUrl}/api/auth/2fa/status`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[API Route] Auth service responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error(`[API Route] Error response: ${errorText}`);
      return NextResponse.json(
        { error: `Auth service error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Return the response from the auth service
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error forwarding request to auth service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
