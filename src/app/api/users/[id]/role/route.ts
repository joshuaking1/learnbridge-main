import { NextRequest, NextResponse } from 'next/server';

// This is a proxy API route that forwards requests to the user service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Forward the request to the user service
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    console.log(`[API Route] Forwarding role update request to ${userServiceUrl}/api/users/${params.id}/role`);

    const response = await fetch(`${userServiceUrl}/api/users/${params.id}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.log(`[API Route] Successfully updated role for user ${params.id}`);

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Error proxying request to user service:', error);
    return NextResponse.json(
      { error: 'Failed to update user role', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
