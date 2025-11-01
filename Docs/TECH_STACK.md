# Technology Stack

This document provides comprehensive details about the technical architecture and technology choices for the EVE Online Tool project.

## Overview

The project consists of three main components:
1. **Backend API** - Node.js/TypeScript REST API with Fastify
2. **Web Application** - Next.js 15 with React (Active Development)
3. **Mobile Application** - React Native + Expo (Phase 2)

---

## Backend Technology Stack

### Framework Decision
**Node.js + TypeScript** (validated via EVE-9)

### Core Technologies

- **Runtime:** Node.js v22 with TypeScript 5.9.3 (strict mode)
- **HTTP Framework:** Fastify 5.6.1 (high-performance)
- **Database:** PostgreSQL 16 with Prisma 6.17.1 ORM
- **Caching:** Redis 7 with ioredis 5.8.1
- **Background Jobs:** BullMQ 5.61.0
- **Authentication:** Passport.js + JWT + EVE SSO OAuth 2.0
- **Payments:** Stripe 19.1.0
- **Push Notifications:** Firebase Admin SDK 13.5.0
- **ESI Client:** Custom Axios-based client with type definitions
- **Code Quality:** ESLint 9, Prettier 3, Husky 9 (Git hooks)

### Project Structure

```
eve-nomad-backend/
├── src/
│   ├── index.ts              # Fastify server entry point
│   ├── controllers/          # Route handlers
│   │   ├── auth.controller.ts     # OAuth flow handlers
│   │   ├── auth.routes.ts         # Auth endpoints
│   │   └── character.routes.ts    # Character management
│   ├── services/             # Business logic
│   │   ├── esi-client.ts          # ESI API client
│   │   ├── token.service.ts       # OAuth token operations
│   │   ├── auth.service.ts        # User/character DB ops
│   │   └── jwt.service.ts         # JWT session management
│   ├── middleware/           # Request middleware
│   │   └── auth.middleware.ts     # JWT authentication
│   ├── jobs/                 # Background jobs
│   │   └── token-refresh.job.ts   # BullMQ token refresh
│   ├── types/                # TypeScript types (esi.ts)
│   └── utils/                # Utility functions
├── prisma/schema.prisma      # Database schema (5 models)
├── docker-compose.yml        # PostgreSQL + Redis services
├── SETUP.md                  # Development setup guide
├── TESTING.md                # Testing and API documentation
├── ESI_RESOURCES.md          # ESI best practices
└── EVE_SSO_SETUP.md          # OAuth registration guide
```

### Development Server

- **API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **API Docs:** http://localhost:3000/docs (Swagger UI)
- **OAuth Login:** http://localhost:3000/auth/login

### Common Commands

```bash
cd eve-nomad-backend
docker-compose up -d          # Start PostgreSQL + Redis
pnpm prisma migrate dev       # Run migrations
pnpm dev                      # Start dev server (hot reload)
pnpm lint                     # Run ESLint
pnpm format                   # Format code with Prettier
pnpm typecheck                # Check TypeScript types
pnpm prisma studio            # Open database UI
```

### Backend Requirements

The backend provides significant infrastructure to justify the subscription model:
- Caching ESI data for performance optimization (Redis)
- Storing historical data unavailable from current API endpoints
- Complex computational analysis (e.g., production chain profitability)
- User account and authentication management (OAuth)
- Push notification systems (Firebase)
- Background job processing (BullMQ)

### Documentation

- Setup Guide: `eve-nomad-backend/SETUP.md`
- Testing Guide: `eve-nomad-backend/TESTING.md`
- ESI Resources: `eve-nomad-backend/ESI_RESOURCES.md`
- OAuth Setup: `eve-nomad-backend/EVE_SSO_SETUP.md`
- Framework Evaluation: `Docs/Backend_Framework_Evaluation.md`

---

## Web Application Stack

### Framework Decision
**Next.js 15** with App Router (Strategic pivot to web-first, see ADR 001)

### Core Technologies

- **Framework:** Next.js 15 (SSR, App Router, Server Components)
- **UI Library:** shadcn/ui + Tailwind CSS
- **State Management:** Zustand (reused from mobile)
- **Data Fetching:** TanStack Query v5 (reused from mobile)
- **HTTP Client:** Axios (reused from mobile)
- **Deployment:** Vercel (production-ready)

### Status

**Active Development** - Week 1 of 3-week MVP timeline

### Progress

- ✅ Strategic pivot documented (EVE-100)
- ✅ Linear project created with 22 issues (EVE-100 to EVE-121)
- 🔄 Next.js initialization (EVE-102)
- 🔄 Business logic migration from mobile (EVE-103)
- 📅 Authentication system (EVE-105 to EVE-109)
- 📅 Dashboard implementation (EVE-114 to EVE-118)
- 📅 Production deployment (EVE-119 to EVE-121)

### Code Reuse

60-70% of mobile business logic transferring to web:
- API client (Axios with interceptors)
- React Query hooks and configuration
- Zustand stores (auth, characters, settings)
- Type definitions and utilities

### Development Location

`eve-nomad-web/` - Next.js 15 web application

---

## Mobile Application Stack

### Framework Decision
**React Native + Expo** (validated via EVE-74, EVE-75, EVE-76)

### Core Technologies

- **Runtime:** React Native 0.81.5 with TypeScript 5.9.2
- **Framework:** Expo 54 (managed workflow)
- **Navigation:** Expo Router 6 (file-based routing)
- **State Management:** React Query v5 (@tanstack/react-query) + Zustand
- **HTTP Client:** Axios 1.12.2 with JWT interceptor
- **Storage:** React Native MMKV 4.0 (encrypted key-value storage)
- **UI Components:** Custom EVE-themed component library (7 components)
- **Code Quality:** ESLint 8, Prettier 3, TypeScript strict mode

### Status

**Paused** - Returning in Phase 2 after web MVP validated with EVE community

### Completed Work (Production-Ready)

- ✅ Complete authentication system (EVE-80 through EVE-84, EVE-99)
  - OAuth login with EVE SSO via deep linking (eveapp://)
  - Registration screen with email/password validation
  - Automatic token refresh (proactive + reactive strategies)
  - Protected route guards with AuthGuard component
  - Logout functionality with complete token cleanup
  - Centralized JWT utilities and race condition fixes
- ✅ Navigation infrastructure (Expo Router with 5-tab layout)
- ✅ UI component library (7 EVE-themed components)
- ✅ State management (Zustand stores for auth, characters, settings)
- ✅ Character components (CharacterCard, CharacterList)
- ✅ API client with backend connectivity

### Project Structure

```
eve-nomad-mobile/
├── app/
│   ├── _layout.tsx           # Root layout (React Query + SafeArea)
│   ├── (auth)/
│   │   ├── _layout.tsx       # Auth flow layout
│   │   ├── login.tsx         # Login screen
│   │   └── register.tsx      # Registration screen
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom tab navigation (5 tabs)
│   │   ├── index.tsx         # Dashboard screen
│   │   ├── skills.tsx        # Skills screen
│   │   ├── wallet.tsx        # Wallet screen
│   │   ├── market.tsx        # Market screen
│   │   └── characters.tsx    # Characters screen
│   └── character/
│       └── [id].tsx          # Dynamic character detail route
├── src/
│   ├── components/ui/        # UI component library (7 components)
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts     # Axios client with JWT auth
│   │   │   └── index.ts      # API service functions
│   │   └── storage.ts        # MMKV storage wrapper
│   ├── types/api.ts          # TypeScript API types
│   ├── utils/
│   │   ├── config.ts         # Environment configuration
│   │   └── theme.ts          # EVE-themed design system
├── app.config.ts             # Dynamic Expo config (env vars)
└── package.json
```

### Environment Configuration

- `.env` file for local development
- `app.config.ts` injects vars via expo-constants
- Type-safe access through `src/utils/config.ts`

### Deep Linking

- **Scheme:** `eveapp://`
- **OAuth callback:** `eveapp://auth/callback`

### Common Commands

```bash
cd eve-nomad-mobile
pnpm start                    # Start Expo dev server
pnpm typecheck                # Check TypeScript types
pnpm format                   # Format code with Prettier
pnpm lint                     # Run ESLint
pnpm ios                      # Run on iOS simulator
pnpm android                  # Run on Android emulator
```

### Code Preservation

- All mobile code preserved in `eve-nomad-mobile/` for Phase 2
- Feature branch `feature/eve-85-mobile-auth-improvements` contains latest work
- Business logic (API client, hooks, stores) being reused in web version

### Future Plan

Mobile becomes "companion app" to web tool after validation

### CCP Compliance

✅ Fully compliant freemium model:
- **Free tier:** Full ESI data access (skills, wallet, market orders, character info)
- **Premium tier ($4.99/month):** Backend services (historical storage, advanced notifications, multi-character analytics)

### Documentation

- Comprehensive Development Plan: `Docs/Frontend_Development_Plan.md` (500+ lines)
- Linear Project: [EVE Nomad Mobile App](https://linear.app/eve-online-tool/project/eve-nomad-mobile-app-a643b937ee26)

---

## ESI API Integration

### Overview

Built on **EVE Swagger Interface (ESI)** - the official RESTful API for EVE Online

### Implementation Details

- Custom ESI client service: `src/services/esi-client.ts`
- TypeScript interfaces for ESI responses: `src/types/esi.ts`
- Respect ESI cache timers and error rate limits
- User-Agent header: "EVE Nomad Development (contact@email.com)"
- Rate limit tracking via X-Esi-Error-Limit headers

### Guidelines

- All features must work within ESI capabilities and limitations
- Implement proper caching to reduce API load
- Handle rate limiting gracefully
- Follow ESI best practices documented in `eve-nomad-backend/ESI_RESOURCES.md`

### Documentation

- ESI API: https://esi.evetech.net/
- Project ESI Resources: `eve-nomad-backend/ESI_RESOURCES.md`

---

## UX Philosophy

- Polished, modern user experience is a premium marketable feature
- Many existing tools are functionally adequate but have poor UX
- Clean, fast, intuitive interface can justify subscription pricing
- Mobile apps should use cross-platform frameworks (React Native/Flutter)
- Web apps should prioritize performance and accessibility

---

## Development Environment

### Required Tools

- Node.js v22+
- pnpm (package manager)
- Docker (for PostgreSQL + Redis)
- Git

### Environment Setup

See individual setup guides:
- Backend: `eve-nomad-backend/SETUP.md`
- Web: `eve-nomad-web/README.md` (when available)
- Mobile: `eve-nomad-mobile/README.md`

---

## Related Documentation

- Backend Framework Evaluation: `Docs/Backend_Framework_Evaluation.md`
- Strategic Decisions: `Docs/ADR/` (Architecture Decision Records)
- Changelog: `CHANGELOG.md`
