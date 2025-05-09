import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { formatBearerToken } from '@/utils/tokenUtils';

// AI Service URL - would be better in an environment variable
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'https://learnbridge-ai-service.onrender.com';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Get the session and user ID from Clerk
    const session = await auth();
    const userId = session.userId;
    
    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Create a properly formatted JWT token for the AI service
    const formattedAuthHeader = formatBearerToken(token);
    
    // Log the request for debugging (without exposing sensitive information)
    console.log('Forwarding TOS generation request to AI service:', {
      url: `${AI_SERVICE_URL}/api/ai/generate/tos`,
      hasAuthHeader: !!authHeader,
      hasUserId: !!userId,
      tokenLength: token.length,
      isFormattedProperly: formattedAuthHeader.startsWith('Bearer ')
    });
    
    // Forward the request to the AI service
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/generate/tos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': formattedAuthHeader,
        'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
        'X-User-ID': userId || ''
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    // Get the response data
    const data = await response.json();

    // Return the response with the same status
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in AI TOS generation API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
