# ESI Client Documentation

## Overview

The Enhanced ESI Client is a production-ready HTTP client for interacting with EVE Online's ESI (EVE Swagger Interface) API. It provides automatic caching, rate limiting, retry logic, and token management.

## Features

✅ **Automatic Token Management** - Pass a `characterId`, client handles token refresh
✅ **Two-Tier Caching** - Redis (L1) + PostgreSQL (L2) for performance and reliability
✅ **Rate Limiting** - Tracks both error limits (420) and new rate limits (429)
✅ **Exponential Backoff** - Retries transient failures with configurable delays
✅ **Comprehensive Error Handling** - Graceful degradation for all ESI status codes
✅ **Type-Safe** - Full TypeScript support with ESI response types

## Architecture

### Caching Strategy

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     HIT     ┌─────────────┐
│ Redis Cache │────────────▶│   Return    │
│    (L1)     │             └─────────────┘
└──────┬──────┘
       │ MISS
       ▼
┌─────────────┐     HIT     ┌─────────────┐
│  Postgres   │────────────▶│  Warm Redis │──▶ Return
│    (L2)     │             └─────────────┘
└──────┬──────┘
       │ MISS
       ▼
┌─────────────┐
│  ESI API    │──▶ Cache in Redis & Postgres ──▶ Return
└─────────────┘
```

**Benefits**:
- Redis provides ultra-fast cache hits (~1ms)
- PostgreSQL ensures cache survives Redis restarts
- ESI Cache-Control headers honored automatically

### Rate Limiting

**Error Limit (420)**:
- 100 errors allowed per 60-second window
- Tracks via `X-ESI-Error-Limit-Remain` header
- Throttles at 80% threshold (80 errors remaining)
- Automatically waits when limit exceeded

**Rate Limit (429)**:
- Token bucket system per route group
- Tracks via `X-Ratelimit-*` headers
- Respects `Retry-After` header

## Installation

The ESI client is already integrated into the EVE Nomad backend. No installation required.

## Basic Usage

### Import

```typescript
import { esiClient } from './services/esi-client';
```

### Public Endpoints (No Authentication)

```typescript
// Get EVE server status
const status = await esiClient.getServerStatus();
console.log(`Players online: ${status.players}`);

// Get universe type info
const tritanium = await esiClient.getUniverseType(34);
console.log(`Name: ${tritanium.name}`);

// Get solar system info
const jita = await esiClient.getSolarSystem(30000142);
console.log(`Security: ${jita.security_status}`);

// Get character public info
const character = await esiClient.getCharacterPublicInfo(2113538741);
console.log(`Name: ${character.name}`);

// Get market prices
const prices = await esiClient.getMarketPrices();
console.log(`Found ${prices.length} market prices`);
```

### Authenticated Endpoints (Require Character ID)

**No manual token management needed!** Just pass the `characterId`:

```typescript
const characterId = 2113538741;

// Get skill queue
const skillQueue = await esiClient.getCharacterSkillQueue(characterId);
console.log(`${skillQueue.length} skills in queue`);

// Get current skills
const skills = await esiClient.getCharacterSkills(characterId);
console.log(`Total SP: ${skills.total_sp.toLocaleString()}`);

// Get wallet balance
const balance = await esiClient.getCharacterWallet(characterId);
console.log(`ISK: ${balance.toLocaleString()}`);

// Get assets
const assets = await esiClient.getCharacterAssets(characterId);
console.log(`${assets.length} assets found`);

// Get EVE mail
const mail = await esiClient.getCharacterMail(characterId);
console.log(`${mail.length} mails`);

// Get specific mail body
const mailBody = await esiClient.getCharacterMailBody(characterId, 123456);
console.log(`Subject: ${mailBody.subject}`);

// Get market orders
const orders = await esiClient.getCharacterOrders(characterId);
console.log(`${orders.length} active orders`);

// Get industry jobs
const jobs = await esiClient.getCharacterIndustryJobs(characterId);
console.log(`${jobs.length} industry jobs`);

// Get planetary colonies
const planets = await esiClient.getCharacterPlanets(characterId);
console.log(`${planets.length} planetary colonies`);
```

## Advanced Usage

### Cache Invalidation

```typescript
// Invalidate specific endpoint cache
await esiClient.invalidateCache('/latest/characters/2113538741/wallet/');

// Invalidate all character caches
await esiClient.invalidateCachePattern('esi:latest:characters:*');

// Invalidate all market caches
await esiClient.invalidateCachePattern('esi:latest:markets:*');
```

### Error Handling

```typescript
try {
  const wallet = await esiClient.getCharacterWallet(characterId);
  console.log(`ISK: ${wallet.toLocaleString()}`);
} catch (error) {
  if (error.message === 'REAUTH_REQUIRED') {
    // Token expired or invalid - redirect user to re-authorize
    console.error('Please re-authorize your character');
  } else if (error.message === 'ESI_ERROR_LIMIT_EXCEEDED') {
    // Hit error limit - wait and retry
    console.error('ESI error limit reached, please try again later');
  } else if (error.message === 'ESI_RATE_LIMIT_EXCEEDED') {
    // Hit rate limit - wait and retry
    console.error('ESI rate limit reached, please try again later');
  } else {
    // Other error
    console.error('ESI error:', error.message);
  }
}
```

### Handling Null Responses (404)

```typescript
// 404 responses return null instead of throwing
const character = await esiClient.getCharacterPublicInfo(999999999);

if (character === null) {
  console.log('Character not found');
} else {
  console.log(`Found: ${character.name}`);
}
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# ESI Configuration
ESI_BASE_URL=https://esi.evetech.net
ESI_USER_AGENT=EVE Nomad (contact@evenomad.com)

# Rate Limiting
ESI_ERROR_LIMIT_THRESHOLD=80  # Stop at 80% of error limit
ESI_MAX_RETRIES=3
ESI_RETRY_DELAY_MS=1000       # Initial delay, doubles each retry

# Caching
REDIS_CACHE_TTL_DEFAULT=300   # 5 minutes default TTL

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                # Optional
REDIS_DB=0
```

## API Reference

### Public Methods

#### `getServerStatus()`
Returns EVE server status including player count.

**Returns**: `Promise<ServerStatus>`

---

#### `getUniverseType(typeId: number)`
Returns universe type information for items, ships, modules, etc.

**Parameters**:
- `typeId` - EVE type ID (e.g., 34 for Tritanium)

**Returns**: `Promise<UniverseType>`

---

#### `getSolarSystem(systemId: number)`
Returns solar system information.

**Parameters**:
- `systemId` - Solar system ID (e.g., 30000142 for Jita)

**Returns**: `Promise<SolarSystem>`

---

#### `getCharacterPublicInfo(characterId: number)`
Returns public character information.

**Parameters**:
- `characterId` - EVE character ID

**Returns**: `Promise<CharacterPublicInfo | null>`

---

#### `getMarketPrices()`
Returns current market prices for all items.

**Returns**: `Promise<MarketPrice[]>`

---

### Authenticated Methods

All authenticated methods require a `characterId` parameter. The client automatically:
1. Fetches the character's valid access token from the database
2. Refreshes the token if expired or expiring soon
3. Injects the token into the request
4. Handles authentication errors

---

#### `getCharacterSkillQueue(characterId: number)`
Returns the character's skill training queue.

**Returns**: `Promise<SkillQueueItem[]>`

---

#### `getCharacterSkills(characterId: number)`
Returns the character's trained skills.

**Returns**: `Promise<CharacterSkills>`

---

#### `getCharacterWallet(characterId: number)`
Returns the character's wallet balance in ISK.

**Returns**: `Promise<number>`

---

#### `getCharacterAssets(characterId: number)`
Returns the character's assets across all locations.

**Returns**: `Promise<Asset[]>`

---

#### `getCharacterMail(characterId: number)`
Returns the character's EVE mail headers.

**Returns**: `Promise<MailHeader[]>`

---

#### `getCharacterMailBody(characterId: number, mailId: number)`
Returns the full body of a specific EVE mail.

**Returns**: `Promise<{ body: string; subject: string; from: number }>`

---

#### `getCharacterOrders(characterId: number)`
Returns the character's active market orders.

**Returns**: `Promise<MarketOrder[]>`

---

#### `getCharacterIndustryJobs(characterId: number)`
Returns the character's industry jobs.

**Returns**: `Promise<IndustryJob[]>`

---

#### `getCharacterPlanets(characterId: number)`
Returns the character's planetary colonies.

**Returns**: `Promise<PlanetaryColony[]>`

---

### Cache Management

#### `invalidateCache(endpoint: string, params?: Record<string, unknown>)`
Invalidates cache for a specific endpoint.

```typescript
await esiClient.invalidateCache('/latest/characters/123/wallet/');
```

---

#### `invalidateCachePattern(pattern: string)`
Invalidates all cache entries matching a pattern.

```typescript
await esiClient.invalidateCachePattern('esi:latest:characters:*');
```

## Type Definitions

All ESI response types are defined in `src/types/esi.ts`:

- `ServerStatus`
- `UniverseType`
- `SolarSystem`
- `CharacterPublicInfo`
- `MarketPrice`
- `SkillQueueItem`
- `CharacterSkills`
- `Asset`
- `MailHeader`
- `MarketOrder`
- `IndustryJob`
- `PlanetaryColony`

## Performance Considerations

### Cache Hit Rates

Monitor cache performance in logs:

```
[Cache] Redis HIT: esi:latest:characters:123:wallet
[Cache] Database HIT: esi:latest:markets:prices
[Cache] MISS: esi:latest:universe:types:34
```

### Rate Limit Warnings

Watch for rate limit warnings:

```
[RateLimit] Approaching error limit: 85 errors remaining
[RateLimit] Waiting 60s due to: Error limit exceeded (420)
[RateLimit] Approaching rate limit for status: 30/150 tokens remaining
```

### Retry Attempts

Monitor retry behavior:

```
[ESI] Retry attempt 1 for /latest/characters/123/wallet/ after 1000ms: ESI server error: 503
[ESI] Retry attempt 2 for /latest/characters/123/wallet/ after 2000ms: ESI server error: 503
```

## Troubleshooting

### "REAUTH_REQUIRED" Error

**Cause**: Character's OAuth token expired or was revoked.

**Solution**: Redirect user to re-authorize via `/auth/login`

---

### Cache Not Working

**Symptoms**: Every request hits ESI, no cache hits in logs.

**Checks**:
1. Redis is running: `docker-compose ps`
2. Database connection working
3. Cache TTL not set to 0
4. Requests not using `skipCache: true`

---

### Rate Limit Errors

**Symptoms**: Frequent 420 or 429 errors.

**Solutions**:
1. Lower `ESI_ERROR_LIMIT_THRESHOLD` (default 80)
2. Increase `ESI_RETRY_DELAY_MS` to slow down requests
3. Check for loops making repeated failed requests
4. Implement request batching where possible

---

### Slow Response Times

**Symptoms**: API calls taking multiple seconds.

**Checks**:
1. Check Redis connection (cache misses are slower)
2. Monitor ESI status: https://esi.evetech.net/latest/status/
3. Check network latency to ESI
4. Review retry attempts in logs

## Best Practices

### 1. Always Use Character ID for Authenticated Calls

✅ **Good**:
```typescript
const wallet = await esiClient.getCharacterWallet(characterId);
```

❌ **Bad** (manual token management):
```typescript
const token = await getTokenSomehow();
// Don't do this - use the built-in methods!
```

### 2. Handle Null Responses

404 errors return `null` instead of throwing:

```typescript
const character = await esiClient.getCharacterPublicInfo(characterId);
if (!character) {
  return res.status(404).send({ error: 'Character not found' });
}
```

### 3. Batch Requests When Possible

Instead of:
```typescript
for (const characterId of characterIds) {
  await esiClient.getCharacterWallet(characterId); // Slow!
}
```

Do:
```typescript
const wallets = await Promise.all(
  characterIds.map(id => esiClient.getCharacterWallet(id))
); // Fast!
```

### 4. Use Cache Invalidation Sparingly

Only invalidate when data is known to be stale:

```typescript
// After user updates their market order, invalidate market cache
await esiClient.invalidateCache(`/latest/characters/${characterId}/orders/`);
```

### 5. Monitor Rate Limits

Set up alerts for approaching rate limits:

```typescript
// In production, send alerts when rate limit warnings appear
if (errorsRemaining <= 20) {
  await sendAlert('ESI error limit approaching');
}
```

## References

- **ESI Swagger Docs**: https://esi.evetech.net/
- **ESI Community**: https://developers.eveonline.com/
- **Rate Limiting Guide**: https://developers.eveonline.com/blog/hold-your-horses-introducing-rate-limiting-to-esi

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0
**Status**: Production Ready ✅
