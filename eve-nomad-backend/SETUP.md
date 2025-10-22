# EVE Nomad Backend - Development Setup Guide

This guide will help you set up the EVE Nomad backend development environment.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js v20+** (LTS version recommended)
- **pnpm** (package manager) - `npm install -g pnpm`
- **Docker & Docker Compose** (for local PostgreSQL + Redis)
- **VS Code** (recommended IDE)
- **Git** (version control)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd eve-nomad-backend
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages including:
- Fastify (HTTP framework)
- Prisma (ORM)
- Redis client (ioredis)
- BullMQ (background jobs)
- Stripe (payments)
- Firebase Admin (push notifications)
- ESLint & Prettier (code quality)

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

#### Required Configuration

```env
# Database (default works with Docker Compose)
DATABASE_URL="postgresql://eveuser:evepass@localhost:5432/evenomad?schema=public"

# Redis (default works with Docker Compose)
REDIS_HOST=localhost
REDIS_PORT=6379

# EVE SSO (MUST register application first!)
EVE_SSO_CLIENT_ID=your_client_id_here
EVE_SSO_CLIENT_SECRET=your_client_secret_here
EVE_SSO_CALLBACK_URL=http://localhost:3000/auth/callback

# ESI User-Agent (include your email!)
ESI_USER_AGENT="EVE Nomad Development (your.email@example.com)"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_secret_here
```

#### Optional Configuration (for later)

```env
# Stripe (for payments - get from stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

### 4. Start Local Services (PostgreSQL + Redis)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL 16 on port 5432
- Redis 7 on port 6379

Verify services are running:

```bash
docker-compose ps
```

### 5. Initialize Database

Run Prisma migrations to create database schema:

```bash
pnpm prisma migrate dev --name init
```

This creates all tables defined in `prisma/schema.prisma`.

### 6. Generate Prisma Client

```bash
pnpm prisma generate
```

### 7. Start Development Server

```bash
pnpm dev
```

The API will be available at:
- **API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **API Docs:** http://localhost:3000/docs

You should see:

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀  EVE Nomad Backend API Server                         ║
║                                                            ║
║   📍  http://localhost:3000                                ║
║   📚  Docs: http://localhost:3000/docs                     ║
║   🏥  Health: http://localhost:3000/health                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### 8. Test the API

Open your browser and visit:
- http://localhost:3000/health - Should return server status
- http://localhost:3000/docs - Swagger UI documentation

## Registering EVE SSO Application

To enable authentication, you must register an application with CCP:

### Steps:

1. Go to https://developers.eveonline.com/
2. Sign in with your EVE Online account
3. Click "Create New Application"
4. Fill in:
   - **Application Name:** EVE Nomad Development
   - **Description:** Mobile companion app for EVE Online
   - **Connection Type:** Authentication & API Access
   - **Callback URL:** `http://localhost:3000/auth/callback`
   - **Scopes:** Select all scopes needed (see ESI_RESOURCES.md)

5. After creation, you'll receive:
   - **Client ID** - Copy to `EVE_SSO_CLIENT_ID` in `.env`
   - **Client Secret** - Copy to `EVE_SSO_CLIENT_SECRET` in `.env`

6. Restart the development server

## Development Workflow

### Running Tests

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

### Formatting

```bash
pnpm format
```

### Type Checking

```bash
pnpm typecheck
```

### Building for Production

```bash
pnpm build
pnpm start
```

## Database Management

### View Database in Prisma Studio

```bash
pnpm prisma studio
```

Opens web UI at http://localhost:5555

### Create New Migration

After modifying `prisma/schema.prisma`:

```bash
pnpm prisma migrate dev --name your_migration_name
```

### Reset Database (⚠️ Deletes all data)

```bash
pnpm prisma migrate reset
```

## Debugging

### VS Code Debugging

Press `F5` or go to Run & Debug panel and select "Debug Backend".

### Viewing Logs

Logs are output to console. In development, they use `pino-pretty` for readable formatting.

### Inspecting Redis

```bash
docker exec -it eve-nomad-redis redis-cli
> KEYS *
> GET some_key
```

### Inspecting PostgreSQL

```bash
docker exec -it eve-nomad-postgres psql -U eveuser -d evenomad
\dt          -- List tables
\d users     -- Describe table
SELECT * FROM users;
```

## Stopping Services

### Stop Development Server
Press `Ctrl+C` in terminal running `pnpm dev`

### Stop Docker Services

```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes data)

```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Change PORT in .env
PORT=3001
```

### Database Connection Error

Check if PostgreSQL is running:

```bash
docker-compose ps
```

If not running:

```bash
docker-compose up -d postgres
```

### Redis Connection Error

Check if Redis is running:

```bash
docker-compose ps
```

### Prisma Client Not Found

Regenerate Prisma Client:

```bash
pnpm prisma generate
```

### ESLint Errors

Fix automatically:

```bash
pnpm lint --fix
```

### TypeScript Errors

Check for errors:

```bash
pnpm typecheck
```

## VS Code Extensions

Install recommended extensions when prompted, or manually install:

- **ESLint** - `dbaeumer.vscode-eslint`
- **Prettier** - `esbenp.prettier-vscode`
- **Prisma** - `Prisma.prisma`
- **Docker** - `ms-azuretools.vscode-docker`
- **Thunder Client** - `rangav.vscode-thunder-client` (API testing)
- **Error Lens** - `usernamehw.errorlens`

## Next Steps

After completing setup:

1. **Register EVE SSO Application** (see above)
2. **Test ESI Integration** - Visit `/docs` and try endpoints
3. **Read ESI_RESOURCES.md** - Learn ESI best practices
4. **Review Prisma Schema** - Understand data models
5. **Start Building Features** - Refer to Linear issues (EVE-10, EVE-11, etc.)

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Build production bundle
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm typecheck        # Check TypeScript types

# Database
pnpm prisma studio            # Open Prisma Studio
pnpm prisma migrate dev       # Run migrations
pnpm prisma generate          # Generate Prisma Client

# Docker
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
docker-compose ps             # List services
```

## Getting Help

- **ESI Documentation:** https://docs.esi.evetech.net/
- **Fastify Docs:** https://fastify.dev/
- **Prisma Docs:** https://www.prisma.io/docs
- **Linear Issues:** Check project management for tasks

## Security Notes

- **Never commit `.env` file** - It's in `.gitignore`
- **Use test keys** for Stripe in development
- **Rotate JWT_SECRET** regularly in production
- **Keep dependencies updated** - Run `pnpm update` weekly
