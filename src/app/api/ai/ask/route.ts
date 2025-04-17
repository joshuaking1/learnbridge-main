import { NextRequest, NextResponse } from 'next/server';

// AI Service URL - would be better in an environment variable
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3004';

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
    const { prompt, includeThinking = false } = body;

    // Prepare the request to the AI service
    const aiRequestBody = {
      prompt,
      includeThinking // Pass this parameter to the AI service if it supports it
    };

    // Forward the request to the AI service
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(aiRequestBody),
    });

    // Get the response data
    const data = await response.json();

    // If the AI service doesn't support thinking process but we requested it,
    // we can generate a mock thinking process here
    if (includeThinking && !data.thinking && data.response) {
      // Add a mock thinking process as a separate field
      data.thinking = `Processing the query: "${prompt}"

Analyzing the question and retrieving relevant information from the Ghanaian Standards-Based Curriculum.

Formulating a comprehensive response based on curriculum guidelines and educational best practices.`;
    }

    // Make sure the response doesn't contain any thinking process
    if (data.response) {
      // Remove any <think> tags and their content from the response
      data.response = data.response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }

    // Return the response with the same status
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in AI ask API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
