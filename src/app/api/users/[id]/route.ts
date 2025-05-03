import { NextRequest, NextResponse } from 'next/server';

// This is a proxy API route that forwards requests to the user service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Forward the request to the user service
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    console.log(`[API Route] Forwarding request to ${userServiceUrl}/api/users/${params.id}`);

    const response = await fetch(`${userServiceUrl}/api/users/${params.id}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[API Route] User service responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error(`[API Route] Error response: ${errorText}`);
      return NextResponse.json(
        { error: `User service error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Get the response data
    const data = await response.json();
    console.log(`[API Route] Successfully fetched user ${params.id}`);

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Error proxying request to user service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details from service', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
