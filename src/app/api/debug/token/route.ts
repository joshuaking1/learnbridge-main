import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isValidJwtFormat } from '@/utils/tokenUtils';

/**
 * Debug endpoint to check token information
 * This is useful for debugging authentication issues
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    // Get the session from Clerk
    const session = await auth();
    const userId = session?.userId;
    
    // Extract token if present
    let token = null;
    let isValidFormat = false;
    
    if (authHeader) {
      token = authHeader.replace('Bearer ', '');
      isValidFormat = isValidJwtFormat(token);
    }
    
    // Decode token payload if it's a valid format
    let decodedPayload = null;
    if (isValidFormat) {
      try {
        // JWT tokens have 3 parts separated by dots
        const parts = token.split('.');
        if (parts.length === 3) {
          // Decode the payload (middle part)
          decodedPayload = JSON.parse(atob(parts[1]));
        }
      } catch (error) {
        console.error('Error decoding token payload:', error);
      }
    }
    
    // Return token information
    return NextResponse.json({
      hasAuthHeader: !!authHeader,
      hasSession: !!session,
      userId,
      tokenLength: token ? token.length : 0,
      isValidFormat,
      tokenInfo: {
        // Only include non-sensitive parts of the token for debugging
        format: isValidFormat ? 'Valid JWT format' : 'Invalid JWT format',
        expiresAt: decodedPayload?.exp ? new Date(decodedPayload.exp * 1000).toISOString() : null,
        issuedAt: decodedPayload?.iat ? new Date(decodedPayload.iat * 1000).toISOString() : null,
        issuer: decodedPayload?.iss || null,
        // Don't include the actual token or sensitive claims
      }
    });
  } catch (error) {
    console.error('Error in token debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
