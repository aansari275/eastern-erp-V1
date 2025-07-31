# 🔧 Vercel Environment Variables Setup

## Required Environment Variables

### 1. **NODE_ENV**
```
NODE_ENV=production
```

### 2. **Firebase Configuration** (Client-side)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. **Firebase Admin SDK** (Server-side)
Instead of using a service account file, use environment variables:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
```

### 4. **SQL Server Database**
```
DB_HOST=167.71.239.104
DB_NAME=empl_data19
DB_USER=sa
DB_PASSWORD=Empl@786
```

### 5. **Optional Settings**
```
PORT=5000
```

## 📝 How to Add Environment Variables in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Your Project**
3. **Go to Settings** → **Environment Variables**
4. **Add each variable one by one**:
   - **Name**: Variable name (e.g., `NODE_ENV`)
   - **Value**: Variable value (e.g., `production`)
   - **Environment**: Select `Production`, `Preview`, and `Development`

## 🔑 Getting Firebase Values

### Client Configuration (from Firebase Console):
1. Go to Firebase Console → Project Settings → General
2. Scroll down to "Your apps" section
3. Click on web app configuration
4. Copy the config values

### Admin SDK Configuration:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Use the values from the downloaded JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (include the full key with \\n)

## 🚨 Important Notes

- **Never commit sensitive keys** to your repository
- **Use \\n instead of actual newlines** in the private key
- **Test the deployment** after setting all variables
- **Keep your keys secure** and rotate them periodically

## ✅ Quick Checklist

- [ ] `NODE_ENV=production`
- [ ] All Firebase client config variables (VITE_*)
- [ ] Firebase Admin SDK variables
- [ ] SQL Server database credentials
- [ ] Test deployment works

Once all environment variables are set, your application will be fully functional on Vercel! 🚀