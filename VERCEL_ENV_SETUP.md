# Vercel Environment Variables Setup Guide

## Quick Setup Checklist

### Step 1: Get Your Neynar Credentials
1. Go to https://neynar.com and sign in
2. Navigate to API settings/dashboard
3. Get your API key
4. Get/create a signer UUID
5. Note your Farcaster FID (FID)

### Step 2: Add Variables to Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click **Settings** → **Environment Variables**

2. **Add Each Variable** (click "Add New")

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_NEYNAR_API_KEY` | `your_neynar_api_key_here` | Production, Preview, Development |
| `NEXT_PUBLIC_USER_FID` | `your_fid_number` | Production, Preview, Development |
| `NEXT_PUBLIC_SIGNER_UUID` | `your_signer_uuid_here` | Production, Preview, Development |
| `WEBHOOK_SECRET` | `your_webhook_secret_here` | Production (optional) |

3. **Redeploy After Adding**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger redeployment

## Variable Details

### NEXT_PUBLIC_NEYNAR_API_KEY
- **Required**: Yes
- **Type**: String
- **Example**: `neynar_abc123xyz...`
- **Note**: Publicly exposed to browser. Consider moving to server-side for production.

### NEXT_PUBLIC_USER_FID
- **Required**: Yes  
- **Type**: String (number as string)
- **Example**: `12345`
- **Description**: The Farcaster ID of the user whose follows you want to manage

### NEXT_PUBLIC_SIGNER_UUID
- **Required**: Yes (for unfollow functionality)
- **Type**: String (UUID format)
- **Example**: `123e4567-e89b-12d3-a456-426614174000`
- **Description**: UUID of the signer for authenticated actions

### WEBHOOK_SECRET
- **Required**: No
- **Type**: String
- **Example**: `secret_abc123...`
- **Description**: Only needed if configuring Neynar webhooks

## Testing Your Setup

After adding variables and redeploying:

1. **Test API Connection**
   - Visit: `https://your-app.vercel.app/api/test-neynar`
   - Should return success message with user info

2. **Check Browser Console**
   - Open browser DevTools
   - Look for any API key errors or warnings

3. **Test Unfollow Page**
   - Visit: `https://your-app.vercel.app/unfollow`
   - Should load your following list

## Troubleshooting

### "API key not found" warning
- ✅ Check variable name is exactly `NEXT_PUBLIC_NEYNAR_API_KEY`
- ✅ Ensure it's added to the correct environment (Production/Preview/Development)
- ✅ Redeploy after adding variables

### "User FID not configured" error
- ✅ Check `NEXT_PUBLIC_USER_FID` is set
- ✅ Ensure it's a valid number

### API calls failing
- ✅ Verify API key is valid and active
- ✅ Check Neynar API status
- ✅ Review Vercel function logs for errors

### Webhook not working
- ✅ Verify `WEBHOOK_SECRET` matches Neynar webhook configuration
- ✅ Check webhook URL is accessible: `https://your-app.vercel.app/api/webhooks/neynar`
- ✅ Review Vercel function logs

## Security Best Practices

⚠️ **Important**: Current setup exposes API keys to client. For production:

1. **Move to Server-Side API Routes**
   - Create `/app/api/neynar/**` routes
   - Remove `NEXT_PUBLIC_` prefix from variables
   - Use server-only environment variables

2. **Use Environment-Specific Variables**
   - Different keys for dev/staging/prod
   - Never commit `.env` files

3. **Rotate Keys Regularly**
   - Change API keys periodically
   - Revoke old keys after rotation

## Example .env.local (for local development)

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_api_key_here
NEXT_PUBLIC_USER_FID=your_fid_here
NEXT_PUBLIC_SIGNER_UUID=your_signer_uuid_here
WEBHOOK_SECRET=your_webhook_secret_here
```

**Note**: `.env.local` is git-ignored and should never be committed.
