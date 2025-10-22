# Testing Guide - EVE Nomad Backend

## Overview

This guide covers testing the OAuth authentication system and API endpoints for the EVE Nomad backend.

## Prerequisites

### 1. Start Docker Services

The application requires PostgreSQL and Redis to be running:

```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

You should see:
- `postgres` on port 5432
- `redis` on port 6379

### 2. Initialize Database

Run Prisma migrations to create database tables:

```bash
pnpm prisma migrate dev --name init
```

This creates:
- `User` table
- `Character` table
- `Session` table
- `Job` table
- `CachedData` table

### 3. Verify Environment Variables

Check `.env` file contains:
```env
# Database
DATABASE_URL=postgresql://eve_nomad:eve_nomad_password@localhost:5432/eve_nomad

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# EVE SSO OAuth
EVE_SSO_CLIENT_ID=your_client_id
EVE_SSO_CLIENT_SECRET=your_client_secret
EVE_SSO_CALLBACK_URL=http://localhost:3000/auth/callback

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

### 4. Start Development Server

```bash
pnpm dev
```

Server should start at `http://localhost:3000`

You should see:
```
🔧 Starting background job workers...
[TokenRefreshJob] Token refresh worker started
[TokenRefreshJob] Token refresh scheduler started (runs every 2 minutes)

╔════════════════════════════════════════════════════════════╗
║   🚀  EVE Nomad Backend API Server                         ║
║   📍  http://localhost:3000                                ║
║   📚  Docs: http://localhost:3000/docs                     ║
║   🏥  Health: http://localhost:3000/health                 ║
╚════════════════════════════════════════════════════════════╝
```

## API Testing

### Health Check

Test basic connectivity:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-17T...",
  "uptime": 123.456,
  "environment": "development",
  "version": "0.1.0"
}
```

### OAuth Authentication Flow

#### 1. Initiate Login

**Browser**: Visit `http://localhost:3000/auth/login`

This will:
1. Redirect you to EVE SSO login page
2. Show your EVE Online characters
3. Ask you to authorize the application

**Expected**: Redirect to `login.eveonline.com`

#### 2. Authorize Application

In the EVE SSO page:
1. Select a character
2. Review requested scopes
3. Click "Authorize"

**Expected**: Redirect back to `http://localhost:3000/auth/callback?code=...&state=...`

#### 3. Complete Authentication

After authorization, you'll receive a JSON response:

```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "subscriptionTier": "free",
    "subscriptionStatus": "active"
  },
  "character": {
    "characterId": 12345678,
    "characterName": "Your Character Name",
    "corporationId": 98765432,
    "allianceId": null,
    "scopes": ["esi-..."]
  }
}
```

**Save the token** - you'll need it for authenticated requests!

### Verify Token

Test token validity:

```bash
curl -X GET http://localhost:3000/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "user": { ... },
  "characters": [ ... ],
  "currentCharacter": { ... }
}
```

### Character Management

#### List All Characters

```bash
curl -X GET http://localhost:3000/api/characters \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "characters": [
    {
      "id": "uuid",
      "characterId": 12345678,
      "characterName": "Character Name",
      "corporationId": 98765432,
      "allianceId": null,
      "scopes": ["esi-..."],
      "createdAt": "2025-10-17T...",
      "lastSyncAt": null
    }
  ]
}
```

#### Add Another Character

**Browser**: Visit `http://localhost:3000/api/characters/add`
(Must be logged in - include Authorization header or use browser with cookies)

This redirects to `/auth/login` to start OAuth flow for a second character.

#### Remove Character

```bash
curl -X DELETE http://localhost:3000/api/characters/12345678 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "message": "Character removed successfully"
}
```

**Note**: You cannot remove the currently active character. Switch to another character first.

### Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

After logout, the token is invalidated and cannot be used.

## Testing Token Refresh

### Automatic Refresh (Background Job)

The token refresh system runs automatically:

1. **Scheduler**: Runs every 2 minutes
2. **Check**: Finds tokens expiring within 5 minutes
3. **Refresh**: Queues refresh jobs for expiring tokens
4. **Update**: Stores new encrypted tokens in database

**Monitor logs**:
```
[TokenRefreshJob] Found 2 characters with expiring tokens
[TokenRefreshJob] Queued refresh for character Name (12345678)
[TokenRefreshJob] Successfully refreshed token for character: 12345678
```

### Manual Refresh Testing

To test token refresh manually:

1. **Create a character** (authorize through OAuth)

2. **Wait 15+ minutes** (tokens expire after 20 minutes)

3. **Make an API call** that uses `getCharacterWithValidToken()`:
   - This will automatically refresh the token if < 5 minutes remaining

4. **Check database** to verify token was updated:
```bash
pnpm prisma studio
```
Look at `Character` table → `tokenExpiresAt` should be ~20 minutes in future

### Simulate Token Expiration

For faster testing, temporarily modify `src/services/token.service.ts`:

```typescript
// Change buffer from 5 minutes to 18 minutes
export function isTokenExpired(expiresAt: Date, bufferMinutes: number = 18): boolean
```

This will trigger refresh immediately since tokens expire after 20 minutes.

## Database Inspection

### Prisma Studio

Visual database browser:

```bash
pnpm prisma studio
```

Opens at `http://localhost:5555`

### Direct SQL Queries

Connect to PostgreSQL:

```bash
docker-compose exec postgres psql -U eve_nomad -d eve_nomad
```

Useful queries:

```sql
-- View all users
SELECT * FROM "User";

-- View all characters
SELECT "characterId", "characterName", "tokenExpiresAt" FROM "Character";

-- View all active sessions
SELECT * FROM "Session" WHERE "expiresAt" > NOW();

-- View token refresh jobs
SELECT * FROM "Job" WHERE "jobType" = 'token-refresh';
```

## Common Issues

### Port Already in Use

**Error**: `EADDRINUSE: address already in use 0.0.0.0:3000`

**Solution**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <process_id> /F

# Or change port in .env
PORT=3001
```

### Cannot Connect to Database

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
1. Check Docker is running: `docker-compose ps`
2. Start services: `docker-compose up -d`
3. Verify DATABASE_URL in `.env`

### Cannot Connect to Redis

**Error**: `connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
1. Check Docker is running: `docker-compose ps`
2. Start services: `docker-compose up -d`
3. Verify REDIS_HOST and REDIS_PORT in `.env`

### OAuth Callback Error

**Error**: `Invalid callback URL`

**Solution**:
1. Verify `EVE_SSO_CALLBACK_URL` matches CCP Developer Application settings
2. URL must be exactly: `http://localhost:3000/auth/callback`
3. Check CCP Developer Portal: https://developers.eveonline.com/

### Token Invalid/Expired

**Error**: `Token expired` or `Invalid token`

**Solution**:
1. JWT tokens expire after 7 days
2. Re-authenticate: Visit `http://localhost:3000/auth/login`
3. Check JWT_SECRET hasn't changed

### OAuth Token Verification 404 Error

**Error**: `Token verification failed: Request failed with status code 404`

**Cause**: Incorrect EVE SSO verification endpoint URL

**Symptoms**:
- OAuth authorization succeeds
- Token exchange completes successfully
- Verification step fails with 404
- Server logs show: `[TokenService] Successfully exchanged authorization code for tokens` followed by 500 error

**Solution**:
Ensure `src/services/token.service.ts` uses the correct verification endpoint:

```typescript
// CORRECT - ESI domain, no /v2/ prefix
const EVE_SSO_VERIFY_URL = 'https://esi.evetech.net/verify/';

// WRONG - Login domain with /v2/ prefix (causes 404)
const EVE_SSO_VERIFY_URL = 'https://login.eveonline.com/v2/oauth/verify';
```

**Note**: The token **exchange** endpoint uses `/v2/oauth/token` on `login.eveonline.com`, but the **verification** endpoint uses `/verify/` on `esi.evetech.net` (different domain, different path).

**Reference**: This was fixed in issue EVE-62

## Performance Testing

### Load Testing with Apache Bench

Test health endpoint:
```bash
ab -n 1000 -c 10 http://localhost:3000/health
```

Test authenticated endpoint:
```bash
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/characters
```

### Token Refresh Performance

Monitor BullMQ dashboard (optional):

Install BullMQ Board:
```bash
pnpm add -D bull-board
```

Add to `src/index.ts` for monitoring jobs in development.

## Security Testing

### Test CSRF Protection

OAuth state parameter prevents CSRF attacks.

**Test**: Try to reuse a callback URL with same `code` parameter
**Expected**: Should fail - authorization codes are single-use

### Test Token Encryption

Check database - tokens should be encrypted:

```sql
SELECT "accessToken" FROM "Character" LIMIT 1;
```

Should see format: `base64:base64:base64` (IV:AuthTag:Encrypted)

**NOT** plain text tokens!

### Test Session Invalidation

1. Login and save token
2. Logout with that token
3. Try to use token again
4. **Expected**: `Session expired or revoked`

## API Documentation

Full interactive API documentation available at:
**http://localhost:3000/docs**

Features:
- Try out endpoints directly in browser
- View request/response schemas
- See all available routes
- Authentication examples

## Next Steps

After successful testing:

1. **Configure Production Environment**
   - Set up production database
   - Configure production OAuth credentials
   - Set environment variables

2. **Deploy Application**
   - Docker container build
   - Environment-specific configs
   - Database migrations in production

3. **Monitor in Production**
   - Set up logging (Sentry, LogRocket)
   - Monitor token refresh success rate
   - Track API performance
   - Watch for failed authentication attempts

## Support

For issues or questions:
- Check server logs: `pnpm dev` output
- Review Prisma migrations: `pnpm prisma migrate status`
- Inspect database: `pnpm prisma studio`
- EVE SSO Status: https://developers.eveonline.com/
