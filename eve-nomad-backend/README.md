# EVE Nomad - Backend API

Backend API server for the EVE Nomad mobile companion app.

## Tech Stack

- **Runtime:** Node.js v20+ with TypeScript
- **Framework:** Fastify (high-performance HTTP framework)
- **Database:** PostgreSQL 16 with Prisma ORM
- **Caching:** Redis 7 with ioredis
- **Background Jobs:** BullMQ
- **Authentication:** Passport.js + JWT + EVE SSO (OAuth 2.0)
- **Payments:** Stripe
- **Push Notifications:** Firebase Admin SDK
- **ESI Integration:** Custom wrapper with Axios

## Project Structure

```
eve-nomad-backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── controllers/          # Route handlers
│   ├── services/             # Business logic
│   ├── models/               # Prisma models
│   ├── middleware/           # Express/Fastify middleware
│   ├── config/               # Configuration files
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── prisma/
│   └── schema.prisma         # Database schema
├── docker-compose.yml        # Local dev services (PostgreSQL + Redis)
├── .env.example              # Environment variables template
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## Development Setup

### Prerequisites

- Node.js v20+ LTS
- pnpm (package manager)
- Docker & Docker Compose (for local PostgreSQL + Redis)
- VS Code (recommended)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment template:
```bash
cp .env.example .env
```

3. Start local services (PostgreSQL + Redis):
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
pnpm prisma migrate dev
```

5. Start development server:
```bash
pnpm dev
```

The API will be available at `http://localhost:3000`.

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Run TypeScript type checking

## Environment Variables

See `.env.example` for required environment variables.

## API Documentation

API documentation will be available at `/docs` when the server is running (Swagger UI).

## License

MIT
