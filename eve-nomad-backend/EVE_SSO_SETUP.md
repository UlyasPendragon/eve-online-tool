# EVE SSO Application Setup Guide

This guide explains how to register your EVE Nomad application with CCP's EVE Single Sign-On (SSO) system to enable OAuth 2.0 authentication.

## Prerequisites

- An EVE Online account in good standing
- Access to https://developers.eveonline.com/

## Step-by-Step Registration

### 1. Access EVE Developers Portal

Navigate to https://developers.eveonline.com/ and sign in with your EVE Online account.

### 2. Create New Application

1. Click **"Create New Application"** button
2. You'll be presented with an application creation form

### 3. Fill in Application Details

#### Basic Information

- **Application Name:** `EVE Nomad Development` (or `EVE Nomad Production` for prod)
- **Description:**
  ```
  EVE Nomad is a mobile companion app for EVE Online players.
  It provides skill queue monitoring, EVE Mail access, market order management,
  asset browsing, and industrial job tracking.
  ```
- **Connection Type:** Select **"Authentication & API Access"**

#### Callback URL

For development:
```
http://localhost:3000/auth/callback
```

For production (when deployed):
```
https://api.evenomad.com/auth/callback
```

**⚠️ Important:** The callback URL must exactly match what you configure in your `.env` file.

### 4. Select Required Scopes

EVE Nomad requires the following ESI scopes:

#### Character Skills
- ✅ `esi-skills.read_skills.v1` - Read character's trained skills
- ✅ `esi-skills.read_skillqueue.v1` - Read character's skill queue

#### EVE Mail
- ✅ `esi-mail.read_mail.v1` - Read character's mail
- ✅ `esi-mail.send_mail.v1` - Send mail as character
- ✅ `esi-mail.organize_mail.v1` - Delete mail and manage labels

#### Market & Trading
- ✅ `esi-markets.read_character_orders.v1` - Read character's market orders
- ✅ `esi-wallet.read_character_wallet.v1` - Read wallet balance and journal

#### Assets
- ✅ `esi-assets.read_assets.v1` - Read character's assets
- ✅ `esi-universe.read_structures.v1` - Read structure info (for asset locations)

#### Industry
- ✅ `esi-industry.read_character_jobs.v1` - Read industry jobs

#### Planetary Interaction
- ✅ `esi-planets.manage_planets.v1` - Read and manage planetary colonies

#### Character Information
- ✅ `esi-characters.read_contacts.v1` - Read character contacts
- ✅ `esi-characters.read_notifications.v1` - Read notifications
- ✅ `esi-location.read_location.v1` - Read current location
- ✅ `esi-location.read_ship_type.v1` - Read current ship

#### Optional (for future features)
- `esi-contracts.read_character_contracts.v1` - Read contracts
- `esi-clones.read_clones.v1` - Read jump clones
- `esi-fittings.read_fittings.v1` - Read saved fittings

### 5. Submit Application

Click **"Create Application"** button.

### 6. Retrieve OAuth Credentials

After creation, you'll be shown:

- **Client ID** - A UUID-like string (e.g., `abc123def456...`)
- **Client Secret** - A long secret string (keep this secure!)

**⚠️ Important:**
- Save the **Client Secret** immediately - it's only shown once!
- Store it in a password manager
- Never commit it to version control

### 7. Configure Environment Variables

Copy the credentials to your `.env` file:

```env
EVE_SSO_CLIENT_ID=your_client_id_here
EVE_SSO_CLIENT_SECRET=your_client_secret_here
EVE_SSO_CALLBACK_URL=http://localhost:3000/auth/callback
```

### 8. Test OAuth Flow

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the OAuth login endpoint (once implemented):
   ```
   http://localhost:3000/auth/login
   ```

3. You should be redirected to EVE SSO login
4. After granting permissions, you'll be redirected back to your callback URL

## Managing Your Application

### View Application Details

1. Go to https://developers.eveonline.com/applications
2. Click on your application name
3. You can view:
   - Client ID
   - Callback URL
   - Scopes
   - Usage statistics

### Update Application Settings

You can modify:
- Application name
- Description
- Callback URL (⚠️ requires updating `.env` too!)
- Scopes (⚠️ users must re-authorize)

**Note:** You cannot change the Client ID or regenerate the Client Secret without creating a new application.

### Delete Application

⚠️ **Warning:** Deleting an application will invalidate all user tokens immediately!

Only delete if:
- You're permanently shutting down the service
- You need to create a fresh application with different credentials

## OAuth 2.0 Flow Overview

### Authorization Code Flow (Used by EVE SSO)

1. **User clicks "Login with EVE"**
   ```
   GET https://login.eveonline.com/v2/oauth/authorize
   ?response_type=code
   &client_id=YOUR_CLIENT_ID
   &redirect_uri=http://localhost:3000/auth/callback
   &scope=esi-skills.read_skills.v1+esi-mail.read_mail.v1
   &state=random_state_string
   ```

2. **User authorizes application**
   - EVE SSO shows consent screen
   - User grants requested permissions

3. **EVE SSO redirects back to your callback**
   ```
   http://localhost:3000/auth/callback?code=AUTH_CODE&state=random_state_string
   ```

4. **Backend exchanges code for tokens**
   ```
   POST https://login.eveonline.com/v2/oauth/token
   Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)

   {
     "grant_type": "authorization_code",
     "code": "AUTH_CODE"
   }
   ```

5. **Receive access token and refresh token**
   ```json
   {
     "access_token": "eyJ...",
     "token_type": "Bearer",
     "expires_in": 1200,
     "refresh_token": "..."
   }
   ```

6. **Verify token and get character info**
   ```
   GET https://esi.evetech.net/verify/
   Authorization: Bearer ACCESS_TOKEN
   ```

   Returns:
   ```json
   {
     "CharacterID": 123456789,
     "CharacterName": "Your Character",
     "Scopes": "esi-skills.read_skills.v1 esi-mail.read_mail.v1"
   }
   ```

## Token Management Best Practices

### Access Tokens
- Expire after **20 minutes**
- Use for ESI API calls
- Store in memory or short-term cache (Redis)
- Refresh before expiration

### Refresh Tokens
- Do **not** expire (until revoked)
- Store encrypted in database
- Use to obtain new access tokens
- Handle refresh failures (require re-authorization)

### Security Recommendations

1. **Encrypt tokens in database:**
   ```typescript
   import crypto from 'crypto';

   const algorithm = 'aes-256-gcm';
   const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
   ```

2. **Refresh tokens automatically:**
   ```typescript
   if (tokenExpiresAt - Date.now() < 5 * 60 * 1000) {
     await refreshAccessToken();
   }
   ```

3. **Handle token revocation:**
   - User can revoke tokens at https://community.eveonline.com/support/third-party-applications/
   - Your app must handle 403 errors gracefully
   - Prompt user to re-authorize

## Testing OAuth Flow

### Manual Testing

Use Postman or curl to test:

```bash
# Step 1: Get authorization URL
curl http://localhost:3000/auth/login

# Step 2: Visit URL in browser, authorize

# Step 3: Copy code from callback redirect

# Step 4: Exchange code for token (backend handles this)
```

### Automated Testing

Use a test character account:
- Create a separate EVE character for testing
- Store test credentials in `.env.test`
- Never use production character credentials in tests

## Troubleshooting

### "Invalid client" Error

**Cause:** Client ID or Secret is incorrect

**Fix:**
1. Double-check `.env` values
2. Ensure no extra spaces or quotes
3. Verify credentials at developers.eveonline.com

### "Redirect URI mismatch" Error

**Cause:** Callback URL doesn't match registered URL

**Fix:**
1. Check `EVE_SSO_CALLBACK_URL` in `.env`
2. Verify registered URL in EVE Developers portal
3. Ensure exact match (including http vs https, trailing slashes)

### "Invalid scope" Error

**Cause:** Requesting scope not registered

**Fix:**
1. Check requested scopes in code
2. Verify scopes selected in EVE Developers portal
3. Update application to add missing scopes

### "Token expired" Error

**Cause:** Using expired access token

**Fix:**
1. Implement automatic token refresh
2. Check token expiration before making requests
3. Use refresh token to get new access token

## Production Deployment

### Before Going Live

1. **Create production application:**
   - Register new application at developers.eveonline.com
   - Use production callback URL (https)
   - Save new credentials separately

2. **Update environment variables:**
   ```env
   EVE_SSO_CLIENT_ID=production_client_id
   EVE_SSO_CLIENT_SECRET=production_secret
   EVE_SSO_CALLBACK_URL=https://api.evenomad.com/auth/callback
   ```

3. **Use HTTPS for callback:**
   - CCP requires HTTPS in production
   - Set up SSL certificate (Let's Encrypt)
   - Configure reverse proxy (nginx/Caddy)

4. **Test thoroughly:**
   - Test full OAuth flow
   - Verify token refresh works
   - Test with multiple characters
   - Handle edge cases (denied authorization, token revocation)

## References

- **EVE SSO Documentation:** https://docs.esi.evetech.net/docs/sso/
- **OAuth 2.0 Spec:** https://oauth.net/2/
- **EVE Developers Portal:** https://developers.eveonline.com/
- **Third-Party Apps (User View):** https://community.eveonline.com/support/third-party-applications/
