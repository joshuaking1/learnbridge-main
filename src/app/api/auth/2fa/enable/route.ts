import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Forward the request to the auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
    console.log(`[API Route] Forwarding request to ${authServiceUrl}/api/auth/2fa/enable`);

    const response = await fetch(`${authServiceUrl}/api/auth/2fa/enable`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Get the response data
    const data = await response.json();

    // Return the response from the auth service
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Error forwarding 2FA enable request:', error);
    return NextResponse.json(
      { error: 'Failed to enable two-factor authentication' },
      { status: 500 }
    );
  }
}