/**
 * Test script for token formatting
 * This is a simple script to test the token formatting utility
 */

import { formatBearerToken, isValidJwtFormat } from './tokenUtils';

// Sample tokens to test
const testCases = [
  { 
    name: 'Valid JWT with Bearer prefix', 
    token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    expectedFormat: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    expectedValid: true
  },
  { 
    name: 'Valid JWT without Bearer prefix', 
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    expectedFormat: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
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

// Run the tests
console.log('Testing token formatting utility...');
console.log('==================================');

testCases.forEach(testCase => {
  console.log(`\nTest case: ${testCase.name}`);
  console.log(`Input token: ${testCase.token}`);
  
  // Test formatBearerToken
  const formattedToken = formatBearerToken(testCase.token);
  console.log(`Formatted token: ${formattedToken}`);
  console.log(`Format test: ${formattedToken === testCase.expectedFormat ? 'PASSED' : 'FAILED'}`);
  
  // Test isValidJwtFormat
  const isValid = isValidJwtFormat(testCase.token);
  console.log(`Validity test: ${isValid === testCase.expectedValid ? 'PASSED' : 'FAILED'}`);
});

console.log('\n==================================');
console.log('Token formatting tests complete');
