# ESI (EVE Swagger Interface) Resources

This document contains essential resources and best practices for working with the EVE Swagger Interface (ESI).

## Official Documentation

### Primary Resources
- **ESI Swagger UI:** https://esi.evetech.net/ui/
  - Interactive API documentation
  - Test endpoints directly in browser
  - View request/response schemas

- **ESI Documentation:** https://docs.esi.evetech.net/
  - Developer guides
  - Authentication guides
  - Best practices

- **EVE Developers Portal:** https://developers.eveonline.com/
  - Register applications for OAuth
  - Access developer resources
  - Community forums

### Community Resources
- **ESI GitHub Issues:** https://github.com/esi/esi-issues
  - Report bugs
  - Request features
  - Check known issues

- **Third-Party Developer Blog:** https://developers.eveonline.com/blog
  - Announcements
  - Breaking changes
  - New features

## ESI Best Practices

### 1. User-Agent Header (REQUIRED)
Always include a descriptive User-Agent with contact information:

```typescript
headers: {
  'User-Agent': 'EVE Nomad (contact@evenomad.com)'
}
```

**Why:** Allows CCP to contact you if your application misbehaves.

### 2. Respect Cache Headers
ESI provides cache control headers - honor them to reduce load:

```
Cache-Control: public, max-age=30    # Cache for 30 seconds
Cache-Control: public, max-age=3600  # Cache for 1 hour
```

**Implementation:** Store cached responses in Redis with TTL matching `max-age`.

### 3. Rate Limit Tracking
Monitor error limit headers to avoid hitting rate limits:

```
X-Esi-Error-Limit-Remain: 98
X-Esi-Error-Limit: 100
X-Esi-Error-Limit-Reset: 60
```

**Best Practice:**
- Track remaining errors
- Implement backoff when < 20 remaining
- Queue requests to prevent burst errors

### 4. Error Handling

#### Common ESI Errors
- **420 Error Limited** - Rate limit exceeded, wait for reset
- **403 Forbidden** - Invalid/expired token (re-auth required)
- **404 Not Found** - Invalid ID (character, type, system, etc.)
- **500 Internal Server Error** - CCP server issues (retry with exponential backoff)
- **502/503/504** - ESI downtime (implement circuit breaker)

#### Retry Strategy
```typescript
// Exponential backoff for transient errors
const retryableStatuses = [500, 502, 503, 504];
if (retryableStatuses.includes(error.response.status)) {
  await sleep(Math.pow(2, attempt) * 1000); // 1s, 2s, 4s, 8s
  retry();
}
```

### 5. OAuth 2.0 Authentication

#### Token Management
- Store tokens encrypted in database
- Refresh tokens before expiration (15 minutes before)
- Handle refresh token failures gracefully (require re-auth)

#### Required Scopes
For EVE Nomad features, request these scopes:

```
esi-skills.read_skills.v1
esi-skills.read_skillqueue.v1
esi-mail.read_mail.v1
esi-mail.send_mail.v1
esi-markets.read_character_orders.v1
esi-assets.read_assets.v1
esi-industry.read_character_jobs.v1
esi-planets.manage_planets.v1
esi-wallet.read_character_wallet.v1
```

## ESI Endpoints by Feature

### EVE Nomad Feature Mapping

#### 1. Skill Queue Monitoring
- `GET /characters/{character_id}/skills/` - Current skills
- `GET /characters/{character_id}/skillqueue/` - Training queue
- `GET /universe/types/{type_id}/` - Skill details

#### 2. EVE Mail
- `GET /characters/{character_id}/mail/` - Mail headers
- `GET /characters/{character_id}/mail/{mail_id}/` - Mail body
- `POST /characters/{character_id}/mail/` - Send mail
- `DELETE /characters/{character_id}/mail/{mail_id}/` - Delete mail

#### 3. Market Orders
- `GET /characters/{character_id}/orders/` - Active orders
- `GET /markets/{region_id}/orders/` - Market data
- `GET /markets/prices/` - Global price data

#### 4. Asset Browser
- `GET /characters/{character_id}/assets/` - All assets
- `POST /characters/{character_id}/assets/locations/` - Asset locations
- `POST /characters/{character_id}/assets/names/` - Asset names

#### 5. Industry Jobs
- `GET /characters/{character_id}/industry/jobs/` - Jobs
- `GET /universe/types/{type_id}/` - Blueprint info

#### 6. Planetary Interaction
- `GET /characters/{character_id}/planets/` - Colonies
- `GET /characters/{character_id}/planets/{planet_id}/` - Colony details

## Versioning Strategy

ESI supports multiple endpoint versions:

- `/latest/` - Auto-updates to newest version (recommended for MVP)
- `/v1/`, `/v2/`, etc. - Specific versions (use for stability)

**For EVE Nomad MVP:** Use `/latest/` initially, migrate to versioned endpoints before production.

## Testing ESI Integration

### Test Character IDs
- **CCP Falcon:** 92168909 (public CCP character)
- **Test Alliance Please Ignore:** Alliance ID 498125261

### Test Type IDs
- **Tritanium:** 34
- **PLEX:** 44992
- **Skill Injector:** 40520

### Test System IDs
- **Jita:** 30000142 (0.9 highsec, trade hub)
- **Perimeter:** 30000144 (near Jita)

## Monitoring ESI Status

- **ESI Status Dashboard:** https://esi.evetech.net/status.html
- **EVE Online Status:** https://eve-offline.net/

## Common Gotchas

### 1. IDs vs Names
ESI works with **IDs only**. You must resolve names to IDs:
- `POST /universe/ids/` - Convert names to IDs
- `POST /universe/names/` - Convert IDs to names

### 2. Pagination
Some endpoints are paginated (X-Pages header):
```
X-Pages: 5
```
Must request each page individually: `?page=1`, `?page=2`, etc.

### 3. ESI Datasource
Always use `tranquility` (production server):
```
?datasource=tranquility
```

### 4. Token Expiration
Access tokens expire after **20 minutes**. Implement automatic refresh:
```typescript
if (tokenExpiresAt - Date.now() < 5 * 60 * 1000) {
  await refreshToken();
}
```

## Circuit Breaker Pattern

Protect your app from ESI downtime:

```typescript
const circuitBreaker = new CircuitBreaker(esiRequest, {
  timeout: 10000,        // 10 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000,   // 30 seconds
});
```

## Useful Tools

- **Postman Collection:** Import ESI swagger spec for testing
- **ESI Monitor:** Track ESI performance and uptime
- **zkillboard API:** Supplementary data source for PvP data

## Contact & Support

- **ESI Issues:** https://github.com/esi/esi-issues
- **EVE Discord:** #esi channel in EVE Online Discord
- **CCP Developer Email:** developers@ccpgames.com
