/**
 * Test script for token formatting
 * This is a simple script to test the token formatting utility
 */

import { formatBearerToken, isValidJwtFormat } from './tokenUtils';

// Sample tokens to test - using dummy tokens for testing only
const testCases = [
  { 
    name: 'Valid JWT with Bearer prefix', 
    token: 'Bearer dummy.token.format',
    expectedFormat: 'Bearer dummy.token.format',
    expectedValid: true
  },
  { 
    name: 'Valid JWT without Bearer prefix', 
    token: 'dummy.token.format',
    expectedFormat: 'Bearer dummy.token.format',
    expectedValid: true
  },
  { 
    name: 'Invalid JWT (malformed)', 
    token: 'not-a-valid-jwt-token',
    expectedFormat: 'Bearer not-a-valid-jwt-token',
    expectedValid: false
  },
  { 
    name: 'Empty token', 
    token: '',
    expectedFormat: '',
    expectedValid: false
  }
];

// Function to run tests without console logging
export function runTokenFormatTests(): { passed: number, failed: number } {
  let passed = 0;
  let failed = 0;

  testCases.forEach(testCase => {
    // Test formatBearerToken
    const formattedToken = formatBearerToken(testCase.token);
    if (formattedToken === testCase.expectedFormat) {
      passed++;
    } else {
      failed++;
    }
    
    // Test isValidJwtFormat
    const isValid = isValidJwtFormat(testCase.token);
    if (isValid === testCase.expectedValid) {
      passed++;
    } else {
      failed++;
    }
  });

  return { passed, failed };
}
