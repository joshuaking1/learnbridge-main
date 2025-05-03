import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();

    // Forward the request to the auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
    console.log(`[API Route] Forwarding request to ${authServiceUrl}/api/auth/2fa/verify`);

    const response = await fetch(`${authServiceUrl}/api/auth/2fa/verify`, {
      headers: {
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
    console.error('[API Route] Error forwarding 2FA verification request:', error);
    return NextResponse.json(
      { error: 'Failed to verify two-factor authentication' },
      { status: 500 }
    );
  }
}