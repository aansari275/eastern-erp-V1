#!/bin/bash

echo "Building the application..."
npm run build

echo "Deployment ready!"
echo ""
echo "To deploy to Vercel:"
echo "1. Go to https://vercel.com"
echo "2. Sign up/Login with your GitHub account"
echo "3. Click 'New Project'"
echo "4. Import your GitHub repository"
echo "5. Set the build command to: npm run build"
echo "6. Set the output directory to: dist/public"
echo "7. Add environment variables if needed"
echo "8. Click Deploy"
echo ""
echo "Or use the Vercel CLI:"
echo "1. Run: npx vercel login"
echo "2. Follow the authentication flow"
echo "3. Run: npx vercel --prod"