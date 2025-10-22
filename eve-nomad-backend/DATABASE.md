# Database Documentation - EVE Nomad Backend

## Overview

The EVE Nomad backend uses **PostgreSQL 16** as its primary database, managed through **Prisma ORM**. The database schema is designed to support a mobile companion app for EVE Online, handling user authentication, character management, background jobs, caching, and push notifications.

## Technology Stack

- **Database**: PostgreSQL 16
- **ORM**: Prisma 6.17.1
- **Migration Tool**: Prisma Migrate
- **Query Builder**: Prisma Client

## Schema Design Philosophy

### Security First
- All OAuth tokens are encrypted using AES-256-GCM before storage
- Passwords are never stored (OAuth-only authentication)
- Foreign key constraints enforce referential integrity
- Cascade deletes prevent orphaned records

### Performance Optimization
- Strategic indexes on frequently queried columns
- Composite indexes for multi-column queries
- Database-level caching supplement to Redis
- Efficient timestamp-based cleanup queries

### EVE Online Integration
- Character data sourced from EVE SSO (OAuth 2.0)
- Token refresh system handles 20-minute token expiry
- Multi-character support per user account
- ESI scope tracking for permission management

## Database Models

### User
**Purpose**: User accounts linked to EVE Online characters

```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Subscription management
  subscriptionTier    String   @default("free")    // "free", "premium"
  subscriptionStatus  String   @default("active")  // "active", "canceled", "expired"
  subscriptionEndsAt  DateTime?
  stripeCustomerId    String?  @unique
  stripeSubscriptionId String? @unique

  // Relations
  characters     Character[]
  sessions       Session[]
  settings       UserSettings?
  notifications  NotificationLog[]
}
```

**Key Points**:
- `id`: CUID for globally unique identifiers
- `email`: Optional (users can authenticate without providing email)
- Subscription fields prepared for Stripe integration
- One-to-many relationship with characters (multi-character support)
- One-to-one relationship with settings

**Indexes**:
- `email` - Fast email lookups
- `stripeCustomerId` - Stripe webhook processing

---

### Character
**Purpose**: EVE Online characters authenticated via ESI OAuth

```prisma
model Character {
  id            String   @id @default(cuid())
  characterId   Int      @unique  // EVE character ID from ESI
  characterName String
  corporationId Int
  allianceId    Int?
  userId        String

  // ESI Token Management (ENCRYPTED)
  accessToken       String   @db.Text
  refreshToken      String   @db.Text
  tokenExpiresAt    DateTime
  scopes            String[]

  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastSyncAt DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Key Points**:
- `characterId`: Unique EVE character ID from CCP
- `accessToken` & `refreshToken`: **Encrypted with AES-256-GCM** (see `token.service.ts`)
- `tokenExpiresAt`: EVE tokens expire after 20 minutes
- `scopes`: ESI permission scopes granted by user
- `allianceId`: Nullable (not all corps are in alliances)

**Indexes**:
- `userId` - Find all characters for a user
- `characterId` - Character lookup by EVE ID
- `tokenExpiresAt` - Token refresh queries
- `[userId, characterId]` - Composite index for user's character queries

**Encryption Details**:
```typescript
// Format: base64(IV):base64(AuthTag):base64(EncryptedData)
encryptedToken = "abc123:def456:ghi789"
```

---

### Session
**Purpose**: JWT session management with device tracking

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique @db.Text  // JWT token
  expiresAt DateTime
  createdAt DateTime @default(now())

  // Device info for push notifications
  deviceType  String? // "ios", "android", "web"
  deviceToken String? // Firebase Cloud Messaging token

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Key Points**:
- `token`: JWT token (not encrypted, signed instead)
- JWT tokens expire after 7 days
- `deviceToken`: FCM token for push notifications
- Cascade delete: Sessions removed when user deleted

**Indexes**:
- `userId` - Find all sessions for a user
- `token` - Session verification
- `expiresAt` - Cleanup expired sessions
- `[userId, expiresAt]` - Composite for user session cleanup

**Cleanup**:
Expired sessions are automatically cleaned every hour (see `src/index.ts:159`)

---

### Job
**Purpose**: Background job tracking for BullMQ integration

```prisma
model Job {
  id          String   @id @default(cuid())
  jobType     String   // "token-refresh", "sync-skills", "sync-mail", etc.
  characterId String?
  status      String   @default("pending") // "pending", "processing", "completed", "failed"
  priority    Int      @default(0)

  // Job data
  payload     Json?   // Job input parameters
  result      Json?   // Job output/results
  error       String? @db.Text

  // Timestamps
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?
}
```

**Key Points**:
- Tracks BullMQ job status in database for auditing
- `payload`: Job configuration (JSON)
- `result`: Job output data (JSON)
- `error`: Failure reason (if status = "failed")

**Job Types**:
- `token-refresh`: Refresh expiring OAuth tokens
- `sync-skills`: Fetch character skill queue from ESI
- `sync-mail`: Fetch EVE mail from ESI
- `sync-market-orders`: Fetch market orders from ESI

**Indexes**:
- `jobType` - Filter by job type
- `status` - Queue processing
- `characterId` - Character-specific jobs
- `createdAt` - Job history queries
- `[status, createdAt]` - Composite for job queue processing

---

### CachedData
**Purpose**: Database-level caching for ESI data

```prisma
model CachedData {
  id         String   @id @default(cuid())
  cacheKey   String   @unique
  data       Json
  expiresAt  DateTime
  createdAt  DateTime @default(now())
}
```

**Key Points**:
- Complements Redis caching
- Persistent cache survives Redis restarts
- `cacheKey`: Unique identifier (e.g., `esi:universe:types:34`)
- `data`: JSON response from ESI

**Cache Key Format**:
```
esi:<category>:<subcategory>:<id>

Examples:
- esi:universe:types:34 (Tritanium item data)
- esi:characters:123456:skills (Character skills)
- esi:market:10000002:orders (Jita market orders)
```

**Indexes**:
- `cacheKey` - Cache lookups
- `expiresAt` - Cleanup expired cache entries

---

### UserSettings
**Purpose**: User preferences and notification settings

```prisma
model UserSettings {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // App preferences
  theme              String  @default("dark") // "light", "dark", "auto"
  defaultCharacterId Int?
  language           String  @default("en")

  // Notification preferences
  notifySkillComplete Boolean @default(true)
  notifyMarketOrders  Boolean @default(true)
  notifyIndustryJobs  Boolean @default(true)
  notifyPIExtractors  Boolean @default(false)
  notifyEveMail       Boolean @default(true)

  // Privacy settings
  shareActivityStats Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Points**:
- One-to-one relationship with User
- `defaultCharacterId`: Auto-select character on login
- Individual notification toggles for different event types
- `shareActivityStats`: Optional community feature (future)

**Notification Types**:
- Skill training complete
- Market orders filled/expired
- Industry jobs complete
- PI extractors depleted
- EVE mail received

**Indexes**:
- `userId` - Settings lookup by user

---

### NotificationLog
**Purpose**: Push notification history and delivery tracking

```prisma
model NotificationLog {
  id          String @id @default(cuid())
  userId      String
  characterId Int?

  // Notification details
  type  String  // "skill_complete", "market_order_filled", etc.
  title String
  body  String @db.Text
  data  Json?  // Additional structured data

  // Delivery tracking
  status String    @default("pending") // "pending", "sent", "failed", "read"
  sentAt DateTime?
  readAt DateTime?
  error  String?   @db.Text

  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Key Points**:
- Audit trail of all notifications
- Tracks delivery success/failure
- `data`: Additional context (item IDs, skill IDs, etc.)
- `status`: Delivery lifecycle tracking

**Notification Status Lifecycle**:
```
pending → sent → read
        ↘ failed
```

**Notification Types**:
- `skill_complete`: Skill training finished
- `market_order_filled`: Market order completed
- `industry_job_complete`: Manufacturing/research job done
- `pi_extractor_expired`: Planetary extraction cycle finished
- `eve_mail_received`: New EVE mail

**Indexes**:
- `userId` - User notification history
- `characterId` - Character-specific notifications
- `status` - Pending/failed notification queries
- `type` - Filter by notification type
- `createdAt` - Chronological ordering
- `[userId, status]` - Composite for user's unread notifications

---

## Relationships Diagram

```
User
├── characters (1:N) → Character
├── sessions (1:N) → Session
├── settings (1:1) → UserSettings
└── notifications (1:N) → NotificationLog

Character
└── user (N:1) → User

Session
└── user (N:1) → User

UserSettings
└── user (1:1) → User

NotificationLog
└── user (N:1) → User

Job
└── (no relations - tracks background jobs)

CachedData
└── (no relations - simple key-value cache)
```

## Migrations

### Migration History

1. **`20251018014129_init`** - Initial schema
   - Created User, Character, Session, Job, CachedData tables
   - Established foreign keys and indexes

2. **`20251018020326_add_user_settings_and_notifications`** - User preferences & notifications
   - Added UserSettings table
   - Added NotificationLog table
   - Enhanced indexes on Character, Session, Job tables

### Running Migrations

**Development**:
```bash
pnpm prisma migrate dev --name <migration_name>
```

**Production**:
```bash
pnpm prisma migrate deploy
```

**Reset Database** (⚠️ DESTROYS ALL DATA):
```bash
pnpm prisma migrate reset
```

### Creating New Migrations

1. Edit `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name <descriptive_name>`
3. Review generated SQL in `prisma/migrations/`
4. Commit migration files to version control

## Seeding

### Seed Data

The database can be populated with test data for development:

```bash
pnpm db:seed
```

**Seed Data Includes**:
- 2 test users (1 free tier, 1 premium)
- 3 test characters with encrypted tokens
- 2 sessions with device tokens
- 3 background jobs (various states)
- 2 cached ESI responses
- 4 notification logs (different types and statuses)
- 2 user settings profiles

**Test Accounts**:
- `pilot1@example.com` - Free tier, 2 characters
- `pilot2@example.com` - Premium tier, 1 character

### Seed Script Location

`prisma/seed.ts` - TypeScript seed file

## Database Maintenance

### Automated Cleanup

**Session Cleanup** (every hour):
```typescript
// src/index.ts:159
setInterval(async () => {
  const cleaned = await jwtService.cleanupExpiredSessions();
}, 60 * 60 * 1000);
```

**Cache Cleanup** (recommended cron job):
```sql
DELETE FROM "CachedData" WHERE "expiresAt" < NOW();
```

### Manual Cleanup Commands

**Delete expired sessions**:
```sql
DELETE FROM "Session" WHERE "expiresAt" < NOW();
```

**Delete old completed jobs**:
```sql
DELETE FROM "Job"
WHERE "status" = 'completed'
  AND "completedAt" < NOW() - INTERVAL '7 days';
```

**Delete old read notifications**:
```sql
DELETE FROM "NotificationLog"
WHERE "status" = 'read'
  AND "readAt" < NOW() - INTERVAL '30 days';
```

## Performance Optimization

### Index Strategy

**Single-column indexes**:
- Primary keys (automatic)
- Foreign keys for join performance
- Frequently filtered columns (status, type, etc.)

**Composite indexes**:
- `[userId, characterId]` - User's character queries
- `[userId, expiresAt]` - Session cleanup for specific user
- `[status, createdAt]` - Job queue processing
- `[userId, status]` - User's unread notifications

### Query Optimization Tips

**Use select to limit returned fields**:
```typescript
await prisma.character.findMany({
  select: {
    characterId: true,
    characterName: true,
    // Don't fetch encrypted tokens if not needed
  },
});
```

**Use transactions for multi-step operations**:
```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { ... } });
  await tx.userSettings.create({ data: { userId: user.id, ... } });
});
```

**Paginate large result sets**:
```typescript
await prisma.notificationLog.findMany({
  take: 50,
  skip: page * 50,
  orderBy: { createdAt: 'desc' },
});
```

## Security Considerations

### Token Encryption

All OAuth tokens (access & refresh) are encrypted before storage:

**Encryption Algorithm**: AES-256-GCM
**Key Derivation**: scrypt
**IV**: 16 bytes (random per encryption)
**Auth Tag**: 16 bytes (for integrity verification)

**Implementation**: `src/services/token.service.ts`

### Environment Variables

**Required**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ENCRYPTION_KEY=<base64_random_key>  # For token encryption
JWT_SECRET=<random_secret>           # For JWT signing
```

**Generate Encryption Key**:
```bash
openssl rand -base64 32
```

### Data Privacy

- Tokens are **never** logged or exposed in API responses
- User email is **optional** (OAuth-only flow supported)
- `shareActivityStats` setting controls data sharing
- All user data deleted on account deletion (CASCADE)

## Prisma Studio

Visual database browser:

```bash
pnpm prisma studio
```

Opens at `http://localhost:5555` with:
- Browse all tables
- Edit records
- View relationships
- Execute queries

## Database Connection Pooling

Prisma automatically manages connection pooling.

**Default Pool Size**:
- `num_cpu_cores * 2 + 1`

**Configure Custom Pool**:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=10"
```

## Backup & Recovery

### Backup Commands

**Full database backup**:
```bash
docker-compose exec postgres pg_dump -U eve_nomad eve_nomad > backup.sql
```

**Schema-only backup**:
```bash
docker-compose exec postgres pg_dump -U eve_nomad --schema-only eve_nomad > schema.sql
```

**Data-only backup**:
```bash
docker-compose exec postgres pg_dump -U eve_nomad --data-only eve_nomad > data.sql
```

### Restore Commands

**Restore from backup**:
```bash
docker-compose exec -T postgres psql -U eve_nomad eve_nomad < backup.sql
```

## Troubleshooting

### Connection Issues

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
1. Check Docker is running: `docker-compose ps`
2. Verify DATABASE_URL in `.env`
3. Test connection: `docker-compose exec postgres psql -U eve_nomad`

### Migration Errors

**Error**: `Migration failed to apply cleanly`

**Solution**:
1. Check database state: `pnpm prisma migrate status`
2. Resolve manually or reset: `pnpm prisma migrate reset` (⚠️ destroys data)
3. Re-run migration: `pnpm prisma migrate deploy`

### Performance Issues

**Slow queries**:
1. Enable query logging: `LOG_LEVEL=debug`
2. Analyze query plan: `EXPLAIN ANALYZE <query>`
3. Add indexes if needed
4. Use Prisma's `$queryRaw` for complex queries

## Best Practices

### Do's ✅

- ✅ Always use Prisma Client for queries (type-safe)
- ✅ Use transactions for multi-step operations
- ✅ Add indexes for frequently filtered columns
- ✅ Validate data at application level before database insert
- ✅ Use `onDelete: Cascade` for parent-child relationships
- ✅ Encrypt sensitive data (tokens, API keys)

### Don'ts ❌

- ❌ Don't store plaintext passwords or tokens
- ❌ Don't expose encrypted tokens in API responses
- ❌ Don't use `prisma migrate reset` in production
- ❌ Don't ignore migration warnings
- ❌ Don't query without indexes on large tables
- ❌ Don't store large binary files in database (use S3/CDN)

## Schema Evolution Guidelines

### Adding New Fields

1. Add field to `schema.prisma` with `@default()` or make it optional
2. Run `pnpm prisma migrate dev --name add_field_name`
3. Update TypeScript types if needed
4. Deploy to production: `pnpm prisma migrate deploy`

### Renaming Fields

1. Create migration with raw SQL:
```sql
ALTER TABLE "User" RENAME COLUMN "old_name" TO "new_name";
```
2. Update `schema.prisma` to match
3. Test thoroughly before production deploy

### Removing Fields

1. Make field optional first, deploy
2. Remove application code using the field
3. After verification, create migration to drop column
4. Update `schema.prisma`

## References

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/16/
- **EVE ESI**: https://esi.evetech.net/
- **CCP Developer License**: https://developers.eveonline.com/

---

**Last Updated**: 2025-10-18
**Schema Version**: 2 (after `add_user_settings_and_notifications` migration)
**Database**: PostgreSQL 16
**ORM**: Prisma 6.17.1
