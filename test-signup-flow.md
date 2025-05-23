# Testing the Signup Role Selection Fix

## What was fixed:

1. **Created new API endpoint**: `/api/auth/update-metadata` that properly updates user metadata in Clerk during signup
2. **Updated RoleSelection component**: Now calls the API to save role, school, and location to Clerk's metadata instead of just localStorage
3. **Updated ClerkAuthSync component**: Prioritizes Clerk metadata over localStorage fallback

## Test Steps:

1. Go to http://localhost:3000/sign-up
2. Complete the initial signup form with email and password
3. You should be redirected to the role selection page
4. Select either "Student" or "Teacher" role
5. Fill in school name and location
6. Click "Complete Registration"
7. Check that the user is properly created with the correct role

## Expected Behavior:

- The role selection form should appear after initial signup
- When you select "Teacher" and complete the form, the user should be created as a teacher
- When you select "Student" and complete the form, the user should be created as a student
- The role should be saved to Clerk's public metadata
- The user should be redirected to the dashboard with the correct role

## How to verify the fix worked:

1. Check the browser console for logs showing metadata update
2. Check Clerk dashboard to see if the user has the correct role in public metadata
3. Check that the user is redirected to the appropriate dashboard based on their role
4. Verify that subsequent logins maintain the correct role

## Fallback mechanism:

If the API call fails, the system will still store the data in localStorage as a fallback, and ClerkAuthSync will pick it up and use it.
