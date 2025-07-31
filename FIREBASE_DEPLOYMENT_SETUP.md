# Firebase Authentication Setup for Replit Deployment

## Issue
Google authentication fails in deployed Replit apps with `auth/unauthorized-domain` error.

## Root Cause
Firebase restricts authentication to authorized domains. When you deploy on Replit, your app gets a `.replit.app` domain that isn't authorized by default.

## Fix Steps

### 1. Get Your Replit Deployment Domain
- Deploy your app using Replit Deployments
- Your domain will be: `your-app-name.replit.app`
- Copy the exact URL from your browser

### 2. Add Domain to Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **rugcraftpro**
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add your Replit domain: `your-app-name.replit.app`
6. Click **Save**

### 3. Domains to Add
For complete coverage, add these domains:
```
localhost (for development)
your-app-name.replit.app (your Replit deployment)
rugcraftpro.firebaseapp.com (Firebase hosting)
```

### 4. Wait for Propagation
- Changes take 5-10 minutes to propagate
- Clear browser cache after making changes
- Test authentication again

## Current Firebase Project
- **Project ID**: rugcraftpro
- **Auth Domain**: rugcraftpro.firebaseapp.com
- **Console URL**: https://console.firebase.google.com/project/rugcraftpro

## Verification
1. Open your deployed app
2. Try Google sign-in
3. Should redirect successfully
4. User should be authenticated

## Troubleshooting
- If still failing, check browser console for specific error codes
- Ensure domain is exactly as shown in browser address bar
- Don't include port numbers unless necessary
- Wait full 10 minutes after adding domain