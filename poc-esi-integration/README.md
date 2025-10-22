# EVE Online ESI Integration - Proof of Concept

**Purpose:** Validate Node.js + TypeScript + ESI integration approach for EVE Nomad backend

**Status:** ✅ Proof of Concept Complete

---

## What This Demonstrates

This proof-of-concept validates the following technical decisions for EVE-9:

✅ **Node.js + TypeScript** - Type-safe ESI client implementation
✅ **Axios HTTP Client** - RESTful API calls to ESI
✅ **ESI API Integration** - Successfully calls unauthenticated endpoints
✅ **TypeScript Interfaces** - Type-safe response handling
✅ **Error Handling** - Proper handling of ESI errors (rate limits, network errors)
✅ **Cache Header Detection** - Logging of ESI cache headers for future caching layer
✅ **Rate Limit Tracking** - Monitoring of X-Esi-Error-Limit headers

---

## Project Structure

```
poc-esi-integration/
├── src/
│   ├── esi-client.ts      # ESI client class with interceptors
│   └── test-esi.ts         # Test script for various endpoints
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore patterns
└── README.md               # This file
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

**Dependencies:**
- `axios` - HTTP client for ESI requests
- `dotenv` - Environment variable management
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution (dev tool)
- `@types/node` - Node.js type definitions

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set your User-Agent (include your email for CCP to contact you):

```env
ESI_BASE_URL=https://esi.evetech.net
ESI_USER_AGENT="EVE Nomad POC (your.email@example.com)"
```

### 3. Run Tests

```bash
npm run test:esi
# or
pnpm test:esi
```

---

## Test Coverage

The proof-of-concept tests the following ESI endpoints:

### 1. Server Status (`/status/`)
- Retrieves online player count
- Server version
- Server start time
- VIP mode status

### 2. Universe Type (`/universe/types/{type_id}/`)
- Tests with Tritanium (Type ID 34)
- Retrieves item name, description, volume, group

### 3. Solar System (`/universe/systems/{system_id}/`)
- Tests with Jita (System ID 30000142)
- Retrieves system name, security status, stations, position

### 4. Character Public Info (`/characters/{character_id}/`)
- Tests with CCP Falcon (Character ID 92168909)
- Retrieves character name, corporation, birthday, gender

### 5. Market Prices (`/markets/prices/`)
- Retrieves all market price data
- Displays sample of average and adjusted prices

---

## Expected Output

```
============================================================
EVE Online ESI Integration - Proof of Concept
============================================================

ESI Base URL: https://esi.evetech.net
User Agent: EVE Nomad POC (your@example.com)

Test 1: Get EVE Server Status
------------------------------------------------------------
[ESI] GET /latest/status/
[ESI] Response Status: 200
[ESI] Cache-Control: public, max-age=30
[ESI] Error Limit Remaining: 100/100
✅ Server Online: 25000 players online
   Server Version: 2408866
   Started: 1/16/2025, 11:00:00 AM

Test 2: Get Universe Type Information (Tritanium - Type ID 34)
------------------------------------------------------------
[ESI] GET /latest/universe/types/34/
[ESI] Response Status: 200
[ESI] Cache-Control: public, max-age=3600
✅ Type Name: Tritanium
   Description: The most common ore type in the known universe, tritanium is still in constant demand...
   Volume: 0.01 m³
   Group ID: 18

... (additional tests)

============================================================
✅ ALL TESTS PASSED
============================================================

ESI Integration validated successfully!
Key findings:
  ✅ Axios HTTP client working correctly
  ✅ ESI endpoints responding as expected
  ✅ Response parsing successful
  ✅ Cache headers detected and logged
  ✅ Error limit headers tracked
  ✅ TypeScript type safety working

Next steps:
  1. Implement OAuth 2.0 for authenticated endpoints
  2. Add token refresh mechanism
  3. Implement caching layer (Redis)
  4. Add rate limit handling
  5. Create wrapper for character-specific endpoints
```

---

## Key Learnings

### 1. ESI Cache Headers

ESI provides cache control headers that should be respected:

```
Cache-Control: public, max-age=30    # Cache for 30 seconds
Cache-Control: public, max-age=3600  # Cache for 1 hour
```

**Implementation Note:** Future caching layer (EVE-13) should honor these headers.

### 2. Rate Limit Tracking

ESI includes error limit headers:

```
X-Esi-Error-Limit-Remain: 98
X-Esi-Error-Limit: 100
X-Esi-Error-Limit-Reset: 60
```

**Implementation Note:** Track these headers and back off when approaching limit (< 20 remaining).

### 3. Error Handling

Common ESI errors to handle:

- **420 Error Limited** - Rate limit exceeded, must wait for reset
- **403 Forbidden** - Invalid authentication (for authed endpoints)
- **404 Not Found** - Invalid ID (character, type, system, etc.)
- **500 Internal Server Error** - CCP server issues, retry with exponential backoff

### 4. User-Agent Requirement

ESI requires a descriptive User-Agent header with contact information:

```
User-Agent: EVE Nomad (contact@example.com)
```

**Compliance:** Allows CCP to contact developer if application misbehaves.

### 5. TypeScript Benefits

Type-safe interfaces caught several potential bugs during development:

```typescript
interface ServerStatus {
  players: number;      // Type-safe: must be number
  server_version: string;
  start_time: string;   // ISO 8601 datetime string
  vip?: boolean;        // Optional: may not always be present
}
```

---

## Next Steps for Full Implementation

### Phase 1: Authentication (EVE-10)
- Implement OAuth 2.0 flow with EVE SSO
- Token storage and refresh mechanism
- Multi-character token management

### Phase 2: Caching Layer (EVE-13)
- Redis integration
- Honor ESI cache headers
- Cache key generation strategy
- Cache invalidation

### Phase 3: Authenticated Endpoints (EVE-12)
- Skill queue (`/characters/{character_id}/skillqueue/`)
- EVE Mail (`/characters/{character_id}/mail/`)
- Market orders (`/characters/{character_id}/orders/`)
- Assets (`/characters/{character_id}/assets/`)
- Industry jobs (`/characters/{character_id}/industry/jobs/`)
- Planetary Interaction (`/characters/{character_id}/planets/`)

### Phase 4: Production Hardening
- Error retry logic with exponential backoff
- Circuit breaker pattern for ESI downtime
- Request queuing and rate limiting
- Monitoring and alerting
- Performance optimization

---

## Technical Validation

### ✅ Validated Decisions

1. **Node.js + TypeScript** - Excellent developer experience, type safety working as expected
2. **Axios HTTP Client** - Simple, powerful, good interceptor support
3. **No ESI Library Dependency** - Direct axios calls give more control, custom wrapper approach validated
4. **TypeScript Strict Mode** - Caught type errors during development, worth the strictness
5. **ESI Versioning** - Using `/latest/` endpoints works well for MVP, can version later

### ⚠️ Considerations for Production

1. **Token Management** - Will need secure storage (encrypted in database)
2. **Rate Limiting** - Need request queue to prevent 420 errors
3. **Caching** - Critical for performance, must implement early
4. **Error Resilience** - Need retry logic and circuit breakers
5. **Monitoring** - Track ESI response times, error rates, cache hit ratios

---

## Framework Decision Validation

This POC confirms that **Node.js + TypeScript is the right choice** for EVE Nomad:

✅ **Development Speed** - POC built in < 1 hour
✅ **Type Safety** - TypeScript prevented multiple bugs
✅ **Ecosystem** - Axios, dotenv, tsx all worked perfectly
✅ **Developer Experience** - Hot reload, good error messages, easy debugging
✅ **ESI Integration** - No blockers, straightforward implementation

**Decision:** Proceed with Node.js + TypeScript for Phase 2 (EVE-9 full setup)

---

## References

- **ESI Documentation:** https://docs.esi.evetech.net/
- **ESI Swagger UI:** https://esi.evetech.net/ui/
- **EVE Developers:** https://developers.eveonline.com/
- **Linear Issue:** EVE-9 (Set up development environment for ESI integration)
- **Framework Evaluation:** `Docs/Backend_Framework_Evaluation.md`
