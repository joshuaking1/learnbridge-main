import { clerkClient } from '@clerk/nextjs/server';

/**
 * Get a user by their Clerk ID
 */
export async function getUserById(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

/**
 * Get a user by their email address
 */
export async function getUserByEmail(email: string) {
  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

/**
 * Update a user's metadata
 */
export async function updateUserMetadata(userId: string, publicMetadata: any, privateMetadata: any = {}) {
  try {
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata,
      privateMetadata,
    });
    return user;
  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw error;
  }
}

/**
 * Set a user's role
 */
export async function setUserRole(userId: string, role: 'student' | 'teacher' | 'admin') {
  try {
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });
    return user;
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
}

/**
 * Create an organization for a user
 */
export async function createOrganization(name: string, userId: string) {
  try {
    const organization = await clerkClient.organizations.createOrganization({
      name,
      createdBy: userId,
    });
    return organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

/**
 * Add a user to an organization
 */
export async function addUserToOrganization(organizationId: string, userId: string, role: 'admin' | 'member') {
  try {
    const membership = await clerkClient.organizations.createOrganizationMembership({
      organizationId,
      userId,
      role,
    });
    return membership;
  } catch (error) {
    console.error('Error adding user to organization:', error);
    throw error;
  }
}

/**
 * Get all users with pagination
 */
export async function getAllUsers(limit = 10, offset = 0) {
  try {
    const users = await clerkClient.users.getUserList({
      limit,
      offset,
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
  try {
    await clerkClient.users.deleteUser(userId);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
