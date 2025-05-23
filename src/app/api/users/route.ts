import { NextRequest, NextResponse } from 'next/server';

// This is a proxy API route that forwards requests to the user service
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

    // Forward the request to the user service
    const userServiceUrl = process.env.USER_SERVICE_URL || 'https://user-service-3j2j.onrender.com';
    console.log(`[API Route] Forwarding request to ${userServiceUrl}/api/users`);

    // Fetch real data from the user service
    console.log('[API Route] Fetching real user data from the user service')
    const response = await fetch(`${userServiceUrl}/api/users`, {
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
    console.log(`[API Route] Successfully fetched ${data.length} users`);

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Error proxying request to user service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users from service', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
