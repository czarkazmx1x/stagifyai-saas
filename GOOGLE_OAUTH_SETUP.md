# Google OAuth Setup Guide

To enable Google Sign-In for your StagifyAI application, follow these steps:

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Configure the consent screen:
   - Choose **External** user type
   - Fill in the required app information
   - Add your email address under developer contact information
   - Add scopes: `../auth/userinfo.email`, `../auth/userinfo.profile`
   - Add test users (during development) or submit for verification (production)

## 2. Configure OAuth Client

For the OAuth client ID setup:
- **Name**: StagifyAI
- **Authorized JavaScript origins**: 
  - `http://localhost:3000` (development)
  - `https://yourdomain.com` (production)
- **Authorized redirect URIs**: 
  - `http://localhost:3000/api/auth/callback/google` (development)
  - `https://yourdomain.com/api/auth/callback/google` (production)

## 3. Update Environment Variables

Copy the Client ID and Client Secret from Google Cloud Console and update your `.env` file:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## 4. Generate NEXTAUTH_SECRET

Generate a secure secret for NextAuth.js:

```bash
npx auth secret
```

Or use an online generator like [https://generate-secret.vercel.app/](https://generate-secret.vercel.app/)

## 5. Test the Integration

1. Restart your development server
2. Navigate to `/login` or `/register`
3. Click the "Continue with Google" button
4. Complete the Google Sign-In flow
5. You should be redirected to the dashboard

## Features Included

✅ **Google OAuth Integration**
- Google Sign-In on login page
- Google Sign-Up on register page
- Automatic user creation and authentication
- Profile picture and name import

✅ **Dual Authentication**
- Email/password authentication (existing)
- Google OAuth authentication (new)
- Seamless user experience

✅ **Session Management**
- Secure session handling with NextAuth.js
- JWT-based authentication
- Automatic user session persistence

## Security Notes

- Always keep your client secrets secure
- Use environment variables for sensitive data
- Configure proper redirect URIs for both development and production
- Enable HTTPS in production
- Consider adding email verification for new users

## Troubleshooting

If you encounter issues:

1. **Invalid redirect URI error**: Make sure the redirect URI in Google Console matches exactly with your application URL
2. **Client ID/Secret errors**: Verify your environment variables are correctly set
3. **CORS issues**: Ensure your authorized JavaScript origins are correctly configured
4. **Permission denied**: Check that you've added the required scopes and configured the OAuth consent screen

For production deployment, you'll need to:
- Submit your OAuth app for verification by Google
- Use HTTPS URLs
- Configure proper domain names
- Set up proper error handling and user feedback