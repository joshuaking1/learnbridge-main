import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateUserMetadata } from '@/lib/clerk-api';

export async function POST(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { role, school, location } = body;

    // Validate required fields
    if (!role || !['student', 'teacher'].includes(role)) {
      return NextResponse.json({ 
        error: 'Valid role (student or teacher) is required' 
      }, { status: 400 });
    }

    // Prepare metadata to update
    const publicMetadata = {
      role,
      school: school || '',
      location: location || ''
    };

    console.log('Updating user metadata:', { userId, publicMetadata });

    // Update user metadata in Clerk
    await updateUserMetadata(userId, publicMetadata);

    console.log('Successfully updated user metadata');

    return NextResponse.json({ 
      message: 'User metadata updated successfully',
      metadata: publicMetadata
    });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
