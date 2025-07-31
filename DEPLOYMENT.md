# Eastern ERP - Deployment Guide

## Quick Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**: Make sure your code is pushed to a GitHub repository
2. **Go to Vercel**: Visit [vercel.com](https://vercel.com)
3. **Sign Up/Login**: Use your GitHub account
4. **New Project**: Click "New Project" button
5. **Import Repository**: Select your GitHub repository
6. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`
7. **Environment Variables** (if needed):
   - Add any required environment variables
8. **Deploy**: Click "Deploy"

### Option 2: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Project Structure

```
eastern-erp-v1/
├── server/           # Backend API (Node.js/Express)
├── client/src/       # Frontend React app
├── dist/            # Build output
│   ├── public/      # Static files (frontend)
│   └── index.js     # Server bundle
├── vercel.json      # Vercel configuration
└── package.json     # Dependencies and scripts
```

## Build Process

The project uses a single package.json with these scripts:
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server

## Vercel Configuration

The `vercel.json` file configures:
- Static file serving from `dist/public`
- API routes through `/api/*` to the Node.js server
- Build command and output directory

## Environment Variables

Add these environment variables in Vercel dashboard:
- `NODE_ENV=production`
- Any Firebase or database configuration variables

## Features Included

✅ Clean Landing Page with Single Login Button  
✅ Clean Dashboard Design  
✅ Dynamic Lab Inspection Form (matches user's layout)  
✅ Fixed Access Control Issues  
✅ Modern UI Components  
✅ Firebase Integration  
✅ SQL Server Database Integration  

## URL Structure

- `/` - Clean Home Dashboard
- `/landing` - Landing Page
- `/quality` - Quality Control & Lab Inspections
- `/sampling` - Sampling Dashboard
- `/admin/users` - User Management
- `/api/*` - Backend API endpoints

## Support

For deployment issues:
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Ensure all dependencies are listed in package.json