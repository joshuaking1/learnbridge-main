import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Error: Invalid webhook signature', {
      status: 400,
    });
  }

  // Get the event type
  const eventType = evt.type;

  // Handle the event
  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        // No action needed for unhandled event types
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error processing webhook' }, { status: 500 });
  }
}

// Handler functions for different event types
async function handleUserCreated(data: any) {
  // Extract user data from Clerk event
  const { id, email_addresses, first_name, last_name, public_metadata } = data;
  const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id)?.email_address;
  const role = public_metadata?.role || 'student';

  // Create user in your database

  // Example API call to your user service
  try {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({
        clerk_id: id,
        email: primaryEmail,
        first_name: first_name || '',
        surname: last_name || '',
        role
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create user in database: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
}

async function handleUserUpdated(data: any) {
  // Extract user data from Clerk event
  const { id, email_addresses, first_name, last_name, public_metadata } = data;
  const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id)?.email_address;
  const role = public_metadata?.role || 'student';

  // Update user in your database

  // Example API call to your user service
  try {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({
        email: primaryEmail,
        first_name: first_name || '',
        surname: last_name || '',
        role
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update user in database: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
}

async function handleUserDeleted(data: any) {
  // Extract user ID from Clerk event
  const { id } = data;

  // Delete or deactivate user in your database

  // Example API call to your user service
  try {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user in database: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
}
