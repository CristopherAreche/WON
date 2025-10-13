# WON App - Vercel Deployment Guide

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Database**: Supabase PostgreSQL database (or any PostgreSQL provider)
3. **Email Service**: Resend API key for email functionality
4. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `CristopherAreche/WON`
4. Select the repository and click "Import"

### 2. Configure Environment Variables

In Vercel dashboard, go to **Settings > Environment Variables** and add:

#### Database Configuration
```
DATABASE_URL=postgresql://username:password@host:port/database?pgbouncer=true
DIRECT_URL=postgresql://username:password@host:port/database
```

#### Authentication
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

#### Email Service (Resend)
```
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=WON App
```

#### Password Reset Settings
```
RESET_TOKEN_TTL_MINUTES=10
RESET_CODE_LENGTH=6
RESET_MAX_ATTEMPTS=5
RESET_LOCKOUT_MINUTES=15
RESET_RATE_LIMIT_PER_EMAIL_PER_HOUR=5
RESET_RATE_LIMIT_PER_IP_PER_HOUR=20
RESET_AUTOSIGNIN=true
```

### 3. Database Setup

Make sure your Supabase database is accessible from Vercel:

1. **Connection Pooling**: Use the pooled connection string for `DATABASE_URL`
2. **Direct Connection**: Use the direct connection string for `DIRECT_URL`
3. **SSL**: Ensure SSL is enabled in your database connection

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-app.vercel.app`

## Post-Deployment

### Update NextAuth Configuration

After deployment, update your `NEXTAUTH_URL` environment variable to match your Vercel domain:
```
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

### Database Migrations

Your Prisma schema will be automatically generated during build. The migrations are already included in the repository.

### Testing

1. Visit your deployed app
2. Test user registration/login
3. Test the onboarding flow
4. Verify all features work correctly

## Troubleshooting

### Build Errors
- Check Vercel build logs for specific errors
- Ensure all environment variables are set correctly
- Verify database connectivity

### Runtime Errors
- Check Vercel function logs
- Verify database permissions
- Check email service configuration

### Common Issues
1. **Database Connection**: Ensure your DATABASE_URL is correct and accessible
2. **NextAuth Errors**: Verify NEXTAUTH_SECRET is set and NEXTAUTH_URL matches your domain
3. **Email Issues**: Check RESEND_API_KEY and email configuration

## Custom Domain (Optional)

To use a custom domain:
1. Go to Vercel dashboard > Domains
2. Add your custom domain
3. Update DNS settings as instructed
4. Update NEXTAUTH_URL to match your custom domain