# Google Authentication Troubleshooting Guide

## Problem Description
You're experiencing issues with Google authentication in your EduFuture application. When clicking on "Sign Up with Google" or "Sign In with Google", the process may not complete properly and doesn't redirect to the OTP verification page.

## Solution Options

### Option 1: Use the Debug Tools Page
I've created a special debug tools page to help diagnose and fix authentication issues.

1. Open your application locally by running:
   ```
   npm run dev
   ```

2. Navigate to http://localhost:5173/debug-tools.html

3. In the Debug Tools page:
   - Click "Sign in with Google" to authenticate with Google
   - After successful authentication, the user details will be automatically filled in
   - Click "Create User Document" to manually create the user in Firestore
   - You can then return to the main app and log in with Google

### Option 2: Try Different Authentication Methods
The application now uses a hybrid approach:
- First attempts a popup-based Google authentication (works better on desktop)
- Falls back to redirect if popup is blocked or closed
- Provides a "Skip verification" option on the OTP verification page for Google users

### Option 3: Deploy Functions for Better Debugging

To properly use all debug features, deploy the updated Firebase functions:

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Deploy the functions:
   ```
   cd functions
   npm run build
   firebase deploy --only functions
   ```

## Technical Details

### What Changed
1. Enhanced Google authentication flow:
   - Popup first, redirect fallback approach
   - Better state management across redirects
   - Direct user creation in Firestore during Google sign-up
   
2. Improved OTP verification:
   - Skip verification option for Google users
   - Better error handling and user feedback
   - Countdown timer for resending OTP

3. Debug Tools:
   - Direct user document creation
   - Authentication state inspection
   - Browser information diagnostics

### How to Test
1. Clear all browser storage:
   - Open Developer Tools (F12)
   - Go to Application tab
   - Clear Site Data and Cookies
   
2. Try signing up with Google
   - If popup works: you'll be directly authenticated
   - If redirect occurs: you should land on OTP verification
   - If issues persist: use the debug tools page

3. Check console logs:
   - Detailed authentication process logging
   - State management tracking
   - Error messages with specifics

## Contact
If issues persist, please provide:
1. Browser console logs
2. Steps to reproduce
3. Browser and device information
