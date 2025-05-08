// frontend/src/lib/feature-flags.ts

/**
 * Feature flag configuration for the authentication transition
 */

import { User } from '@/types/shared';

// Feature flag names
export enum FeatureFlag {
  USE_CLERK_AUTH = 'use_clerk_auth',
  SHOW_AUTH_TRANSITION_BANNER = 'show_auth_transition_banner',
  ENABLE_SOCIAL_LOGIN = 'enable_social_login',
  ENABLE_PASSWORDLESS_LOGIN = 'enable_passwordless_login',
}

// Default feature flag values
const defaultFlags: Record<FeatureFlag, boolean> = {
  [FeatureFlag.USE_CLERK_AUTH]: false,
  [FeatureFlag.SHOW_AUTH_TRANSITION_BANNER]: false,
  [FeatureFlag.ENABLE_SOCIAL_LOGIN]: false,
  [FeatureFlag.ENABLE_PASSWORDLESS_LOGIN]: false,
};

// User segments for gradual rollout
export enum UserSegment {
  ALPHA_TESTERS = 'alpha_testers',
  BETA_TESTERS = 'beta_testers',
  EARLY_ADOPTERS = 'early_adopters',
  GENERAL_USERS = 'general_users',
}

// Segment definitions (user IDs or criteria)
const segments: Record<UserSegment, (user: User) => boolean> = {
  [UserSegment.ALPHA_TESTERS]: (user) => {
    // Alpha testers are internal team members
    const alphaTesterEmails = [
      'admin@learnbridgedu.com',
      'dev@learnbridgedu.com',
      'test@learnbridgedu.com',
    ];
    return alphaTesterEmails.includes(user.email);
  },
  [UserSegment.BETA_TESTERS]: (user) => {
    // Beta testers are users who opted in
    return user.betaTester === true;
  },
  [UserSegment.EARLY_ADOPTERS]: (user) => {
    // Early adopters are users who have been active recently
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const lastActive = new Date(user.lastActiveAt || '');
    return lastActive > twoWeeksAgo;
  },
  [UserSegment.GENERAL_USERS]: () => {
    // All users
    return true;
  },
};

// Rollout schedule - which segments get which features
const rolloutSchedule: Record<FeatureFlag, UserSegment[]> = {
  [FeatureFlag.USE_CLERK_AUTH]: [
    UserSegment.ALPHA_TESTERS,
    UserSegment.BETA_TESTERS,
    UserSegment.EARLY_ADOPTERS,
    UserSegment.GENERAL_USERS,
  ],
  [FeatureFlag.SHOW_AUTH_TRANSITION_BANNER]: [
    UserSegment.ALPHA_TESTERS,
    UserSegment.BETA_TESTERS,
    UserSegment.EARLY_ADOPTERS,
    UserSegment.GENERAL_USERS,
  ],
  [FeatureFlag.ENABLE_SOCIAL_LOGIN]: [
    UserSegment.ALPHA_TESTERS,
    UserSegment.BETA_TESTERS,
  ],
  [FeatureFlag.ENABLE_PASSWORDLESS_LOGIN]: [
    UserSegment.ALPHA_TESTERS,
  ],
};

// Rollout percentages by segment (0-100)
const rolloutPercentages: Record<UserSegment, number> = {
  [UserSegment.ALPHA_TESTERS]: 100, // 100% of alpha testers
  [UserSegment.BETA_TESTERS]: 100, // 100% of beta testers
  [UserSegment.EARLY_ADOPTERS]: 25, // 25% of early adopters
  [UserSegment.GENERAL_USERS]: 0, // 0% of general users initially
};

/**
 * Check if a user is in a specific segment
 */
function isUserInSegment(user: User, segment: UserSegment): boolean {
  return segments[segment](user);
}

/**
 * Check if a user should have a feature enabled based on segment and rollout percentage
 */
function shouldEnableFeatureForUser(user: User, flag: FeatureFlag): boolean {
  // Check if feature is enabled for any of the user's segments
  for (const segment of rolloutSchedule[flag]) {
    if (isUserInSegment(user, segment)) {
      // User is in this segment, check rollout percentage
      const percentage = rolloutPercentages[segment];
      
      if (percentage === 100) {
        // Feature is fully rolled out to this segment
        return true;
      } else if (percentage > 0) {
        // Feature is partially rolled out to this segment
        // Use a hash of the user ID to determine if they're in the rollout percentage
        const hash = hashString(user.id.toString());
        const normalizedHash = hash % 100; // 0-99
        return normalizedHash < percentage;
      }
    }
  }
  
  return false;
}

/**
 * Simple string hashing function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get feature flags for a user
 */
export function getFeatureFlags(user?: User | null): Record<FeatureFlag, boolean> {
  if (!user) {
    return defaultFlags;
  }
  
  const flags = { ...defaultFlags };
  
  // Check each feature flag
  Object.values(FeatureFlag).forEach((flag) => {
    flags[flag] = shouldEnableFeatureForUser(user, flag);
  });
  
  // Override with explicit opt-in/out if available
  if (user.featureFlags) {
    Object.entries(user.featureFlags).forEach(([flag, value]) => {
      if (Object.values(FeatureFlag).includes(flag as FeatureFlag)) {
        flags[flag as FeatureFlag] = value;
      }
    });
  }
  
  return flags;
}

/**
 * Update rollout percentages (for admin use)
 */
export function updateRolloutPercentage(segment: UserSegment, percentage: number): void {
  if (percentage >= 0 && percentage <= 100) {
    rolloutPercentages[segment] = percentage;
  }
}

/**
 * Get current rollout percentages (for admin use)
 */
export function getRolloutPercentages(): Record<UserSegment, number> {
  return { ...rolloutPercentages };
}
