# EVE Online Tool

> **Platform for building third-party tools for the EVE Online community**

A commercial SaaS platform providing mobile and web-based tools for EVE Online players, starting with EVE Nomad - a premium mobile companion app.

[![CI Status](https://github.com/YOUR_USERNAME/eve-online-tool/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/eve-online-tool/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [About](#about)
- [Products](#products)
- [Project Status](#project-status)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

EVE Online Tool is a platform for building third-party tools that serve the EVE Online player community. The project aims to create sustainable, commercial applications while complying with CCP Games' Developer License Agreement and Third-Party Policies.

### Mission

- Solve real pain points for EVE Online players
- Build sustainable, well-maintained tools (avoid abandonment)
- Implement ethical freemium models (value-added services, not paywalled ESI data)
- Maintain CCP compliance and community trust

## 🚀 Products

### EVE Nomad (Primary MVP - In Development)

Cross-platform mobile companion app for iOS and Android.

**Free Tier:**
- Skill queue monitoring with push notifications
- EVE server status and downtime alerts
- Wallet balance tracking
- Character switching

**Premium Tier ($2-5/month):**
- EVE Mail access
- Market order management
- Asset browser
- Industry and PI dashboards
- Multi-character aggregation

### Future Products

- **The Industrialist's Ledger**: Advanced production planner for manufacturers
- **The CEO's Dashboard**: Corporation management SaaS for small to medium corps

## 📊 Project Status

**Phase 1: Foundation & Infrastructure** - Active Development

### Completed ✅
- EVE SSO OAuth 2.0 authentication with token encryption
- JWT session management with database tracking
- Multi-character support (add/remove characters)
- Background token refresh (BullMQ)
- Prisma ORM with PostgreSQL 16
- Redis caching layer
- Production-grade Pino logging with Sentry integration
- Custom domain error handling
- ESI client service with type definitions
- Code quality tooling (ESLint, Prettier, TypeScript strict mode)

### In Progress 🔨
- GitHub repository setup and version control
- Database schema refinement
- ESI client library expansion
- ESI data caching implementation

### Upcoming 📅
- Continuous Integration pipeline
- User account management
- Subscription billing (Stripe)
- Server hosting and monitoring

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js v22 + TypeScript 5.9 (strict mode)
- **Framework**: Fastify 5.6.1 (high-performance HTTP server)
- **Database**: PostgreSQL 16 with Prisma 6.17.1 ORM
- **Caching**: Redis 7 with ioredis 5.8.1
- **Background Jobs**: BullMQ 5.61.0
- **Authentication**: Passport.js + JWT + EVE SSO OAuth 2.0
- **Payments**: Stripe 19.1.0 (planned)
- **Push Notifications**: Firebase Admin SDK 13.5.0
- **Logging**: Pino with Sentry integration
- **API Integration**: Custom ESI client (EVE Swagger Interface)

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint 9, Prettier 3, Husky 9
- **Testing**: (To be determined)
- **Monitoring**: Sentry

### Mobile (Planned)
- **Framework**: React Native or Flutter (TBD)
- **Platforms**: iOS and Android

## 🏁 Getting Started

### Prerequisites

- Node.js v22 or higher
- pnpm v8 or higher
- Docker and Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/eve-online-tool.git
   cd eve-online-tool
   ```

2. **Install dependencies**
   ```bash
   cd eve-nomad-backend
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   **Required Environment Variables:**
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/eve_nomad

   # Redis
   REDIS_URL=redis://localhost:6379

   # JWT
   JWT_SECRET=your-secure-jwt-secret-here

   # Token Encryption (32 bytes = 64 hex chars)
   # Generate with: openssl rand -hex 32
   ENCRYPTION_KEY=your-64-character-hex-string-here

   # EVE SSO OAuth
   ESI_CLIENT_ID=your-eve-sso-client-id
   ESI_CLIENT_SECRET=your-eve-sso-client-secret
   ESI_CALLBACK_URL=http://localhost:3000/auth/callback

   # Sentry (optional)
   SENTRY_DSN=your-sentry-dsn
   SENTRY_ENVIRONMENT=development
   ```

4. **Start Docker services (PostgreSQL + Redis)**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   pnpm prisma migrate dev
   ```

6. **Generate Prisma Client**
   ```bash
   pnpm prisma generate
   ```

7. **Start development server**
   ```bash
   pnpm dev
   ```

The API server will start at http://localhost:3000

- **API Documentation**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

### EVE SSO Setup

To use EVE SSO authentication, you need to register your application with CCP:

1. Go to https://developers.eveonline.com/
2. Create a new application
3. Set callback URL to `http://localhost:3000/auth/callback`
4. Request scopes: `publicData`, `esi-characters.read_characters.v1`, etc.
5. Copy Client ID and Secret to `.env`

See `eve-nomad-backend/EVE_SSO_SETUP.md` for detailed instructions.

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm typecheck        # Run TypeScript type checking

# Database
pnpm prisma studio    # Open Prisma Studio (database GUI)
pnpm prisma migrate dev        # Create new migration
pnpm prisma migrate deploy     # Run migrations in production
pnpm prisma generate  # Generate Prisma Client

# Testing
pnpm test             # Run tests (when implemented)
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Docker
docker-compose up -d  # Start PostgreSQL + Redis
docker-compose down   # Stop services
docker-compose logs   # View logs
```

### Development Workflow

1. Create a new branch from `main`: `git checkout -b feature/eve-XX-feature-name`
2. Make your changes following the code style guide
3. Run linting and type checking: `pnpm lint && pnpm typecheck`
4. Test your changes thoroughly
5. Commit with Linear issue reference: `git commit -m "EVE-XX: Description"`
6. Push and create a pull request
7. Complete the PR checklist (quality gates, testing, documentation)

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Code Quality Standards

- **TypeScript strict mode** - All code must pass `tsc --noEmit`
- **ESLint** - No warnings allowed
- **Prettier** - Consistent code formatting
- **No console.log** - Use Pino logger for all logging
- **Custom domain errors** - Use error classes from `types/errors.ts`
- **Error handling** - All async operations wrapped in try-catch
- **Documentation** - Complex logic must have comments

### Quality Gates (Subagents)

This project uses specialized subagents for code quality review:

- **security-auditor**: Required for auth, payments, sensitive data
- **code-reviewer**: Required for feature completion
- **esi-integration-expert**: Required for ESI endpoint changes
- **database-optimizer**: Required for schema or query changes
- **test-architect**: Required if coverage < 80%
- **api-architect**: Required for new API surface

See `SUBAGENTS.md` for usage guidelines.

## 📁 Project Structure

```
eve-online-tool/
├── .github/
│   ├── workflows/          # GitHub Actions CI/CD
│   └── PULL_REQUEST_TEMPLATE.md
├── Docs/                   # Project documentation
│   ├── idea research.md    # Product research
│   ├── CCP_Compliance_Documentation.md
│   └── Backend_Framework_Evaluation.md
├── eve-nomad-backend/     # Backend API (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── jobs/          # Background jobs (BullMQ)
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Database migrations
│   ├── tests/             # Test files
│   ├── docker-compose.yml # PostgreSQL + Redis
│   ├── SETUP.md           # Setup guide
│   ├── TESTING.md         # Testing guide
│   └── package.json
├── CLAUDE.md              # AI development guide
├── SUBAGENTS.md           # Subagent usage guide
├── CONTRIBUTING.md        # Contribution guidelines
├── LICENSE                # MIT License
└── README.md              # This file
```

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)**: Project overview and development guidance
- **[SUBAGENTS.md](SUBAGENTS.md)**: Code quality subagent usage
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Contribution guidelines
- **[Docs/](Docs/)**: Detailed research and planning documentation
- **[eve-nomad-backend/SETUP.md](eve-nomad-backend/SETUP.md)**: Backend setup guide
- **[eve-nomad-backend/TESTING.md](eve-nomad-backend/TESTING.md)**: Testing documentation
- **[eve-nomad-backend/ESI_RESOURCES.md](eve-nomad-backend/ESI_RESOURCES.md)**: ESI API best practices

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Process

1. Check Linear for available issues or create a new one
2. Assign yourself to the issue
3. Create a branch following our naming convention
4. Make your changes with appropriate tests
5. Submit a PR using the template
6. Complete quality gate reviews as needed
7. Get approval and merge

### Reporting Issues

- Use Linear for issue tracking
- Provide detailed reproduction steps
- Include environment information
- Add screenshots or videos if applicable

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎮 EVE Online Compliance

This project complies with CCP Games' Developer License Agreement and Third-Party Policies:

- ✅ Uses official EVE Swagger Interface (ESI) API
- ✅ Implements EVE SSO for authentication
- ✅ Does not charge for direct ESI data access
- ✅ Freemium model based on value-added backend services
- ✅ No gameplay automation or botting features

**EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved worldwide. All other trademarks are the property of their respective owners. EVE Online, the EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf. All artwork, screenshots, characters, vehicles, storylines, world facts or other recognizable features of the intellectual property relating to these trademarks are likewise the intellectual property of CCP hf. CCP is in no way affiliated with this project.**

## 🔗 Links

- **Linear Workspace**: https://linear.app/eve-online-tool
- **EVE Developer Portal**: https://developers.eveonline.com/
- **EVE Swagger Interface**: https://esi.evetech.net/
- **CCP Third-Party Policies**: https://developers.eveonline.com/resource/license-agreement

## 📧 Contact

For questions or support, please create an issue in Linear or contact [your email/discord].

---

**Status**: Active Development - Phase 1 (Foundation & Infrastructure)

Built with ❤️ for the EVE Online community
