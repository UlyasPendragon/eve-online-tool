# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### In Progress
- **EVE-100 to EVE-121**: Web application development (Next.js 15)
  - Strategic pivot to web-first approach
  - Business logic migration from mobile

## [0.1.0-alpha] - 2025-10-30

### Backend Infrastructure

#### EVE-9: Development Environment Setup
- Node.js + TypeScript backend with Fastify
- PostgreSQL 16 + Redis 7 (Docker)
- Prisma ORM, BullMQ, authentication ready
- ESI client service with type definitions
- OAuth 2.0 flow working (authorization complete)
- All documentation and setup guides created

#### EVE-10: ESI OAuth Authentication System
- Full OAuth 2.0 authorization code flow implemented
- Token exchange, verification, and refresh
- AES-256-GCM token encryption
- JWT session management with database tracking
- Multi-character support (add/remove characters)
- Background token refresh job (BullMQ)
- Auth middleware for protected routes
- Complete testing documentation created

#### EVE-64: GitHub Repository Setup
- Created public repository at https://github.com/UlyasPendragon/eve-online-tool
- Comprehensive .gitignore, .gitattributes, LICENSE (MIT)
- Branch protection rules on main (PR reviews, status checks required)
- Security features enabled (Dependabot, secret scanning, push protection)
- GitHub Actions CI/CD pipeline (lint, typecheck, test, security scan)
- Complete documentation (README, CONTRIBUTING, PR template)
- Linear-GitHub integration with two-way sync
- Initial commit (83 files, 27,524 lines) tagged as v0.1.0-alpha

#### EVE-65: Prisma Client Singleton Pattern
- Created shared Prisma client utility
- Updated all services to use getPrisma()
- Added graceful shutdown to server
- Prevents connection pool exhaustion and memory leaks

#### EVE-66: Custom Domain Errors
- Replaced generic Error classes with domain-specific errors
- RecordNotFoundError, ReauthRequiredError, AuthorizationError
- Proper HTTP status codes (404, 401, 403, 500)
- Better error categorization in Sentry

#### EVE-67: Production-Grade Logging
- Replaced all console.log with Pino logger
- Structured logging with context objects
- Automatic Sentry integration for errors
- Sensitive data redaction and correlation IDs

#### EVE-68: Token Encryption Error Handling
- Created config validator with startup validation
- Wrapped all encryption/decryption calls in try-catch
- Fail-fast on missing or invalid ENCRYPTION_KEY
- Graceful error handling for configuration issues

#### EVE-69: Race Condition Fix
- Refactored to use Prisma's atomic upsert operation
- Eliminated check-then-update pattern
- Prevents concurrent OAuth flow failures
- Idempotent character creation/update

#### EVE-104: Backend CORS Configuration
- Updated CORS_ORIGIN in eve-nomad-backend/.env to include http://localhost:3001
- Maintains existing mobile URLs (localhost:19006, localhost:19000)
- Added inline comments documenting mobile vs web URLs
- Enables Next.js web client to make API requests to backend

### Mobile Application

#### EVE-74: Expo Router Navigation
- File-based routing with Expo Router v6
- Root layout with React Query v5 + SafeAreaProvider
- Auth flow: login/register screens
- Main app: bottom tab navigation (5 tabs)
- Dynamic routes for character details
- Deep linking configured (eveapp://)

#### EVE-75: EVE-Themed UI Component Library
- 7 reusable components (Button, Card, Input, Badge, Text, LoadingSpinner, LoadingSkeleton)
- Multiple variants and sizes for each component
- EVE Online dark space theme (#0A0E27 background, #1E88E5 primary)
- Fully type-safe with TypeScript
- Consistent spacing and color system

#### EVE-76: API Client Configuration
- Dynamic environment variable injection via app.config.ts + dotenv
- High-level API service functions for all backend endpoints
- Backend connectivity verified (health check passed)
- Comprehensive .env.example documentation

#### EVE-80: EVE SSO OAuth Login Flow
- Mobile OAuth service with deep linking (eveapp://auth/callback)
- expo-web-browser integration for system browser OAuth
- useOAuth hook with React Query for state management
- Functional login screen with EVE SSO button
- Backend mobile support (mobile=true query parameter, deep link redirect)
- PR: https://github.com/UlyasPendragon/eve-online-tool/pull/28

#### EVE-81: Registration Screen
- Complete registration form with email, password, confirm password fields
- Real-time validation (email format, password 8+ chars, confirmation match)
- Visual error feedback with red borders and inline messages
- Success alerts with redirect to login
- Alternative OAuth signup option
- Keyboard-aware scrollable layout
- PR: https://github.com/UlyasPendragon/eve-online-tool/pull/28

#### EVE-82: Automatic Token Refresh
- Proactive refresh (5-minute buffer before JWT expiry)
- Reactive refresh (401 response interceptor)
- Request queueing to prevent duplicate refresh calls
- Automatic logout navigation on refresh failure
- Backend /auth/refresh endpoint (generate new JWT, invalidate old session)
- JWT decoding without verification on client
- PR: https://github.com/UlyasPendragon/eve-online-tool/pull/28

#### EVE-83: Protected Route Authentication Guard
- AuthGuard component for route protection
- JWT token validation with expiry checking
- Client-side token decoding without verification
- Automatic redirect to login with returnUrl preservation
- Loading spinner during authentication check
- Applied to all protected routes (tabs, character details)
- Post-login redirect to intended destination

#### EVE-84: Logout Functionality
- Complete logout service with backend session invalidation
- useLogout hook with React Query cache management
- Multi-step cleanup: backend logout → token removal → storage clear → cache clear
- Automatic navigation to login screen
- Error handling that prioritizes security (logout locally even if backend fails)
- Logout button in Characters screen with confirmation dialog
- Logout UI accessible via main app navigation

#### EVE-99: Mobile Authentication Critical Fixes
- Created centralized JWT utility module (src/utils/jwt.ts) with 7 functions
- Eliminated 150+ lines of code duplication across AuthGuard, useOAuth, API client
- Fixed token refresh race condition with promise deduplication
- Fixed AuthGuard useEffect dependencies (React best practices)
- Fixed login navigation timing with try-catch error propagation
- Added Zustand stores (auth, characters, settings)
- Created reusable character components (CharacterCard, CharacterList)
- All TypeScript checks passing (0 errors)
- PR: https://github.com/UlyasPendragon/eve-online-tool/pull/33

### Development Tools

#### EVE-8: EVE Partner Program Application
- Prepared comprehensive application template
- Documented requirements and benefits
- Planned timeline for submission (post-1000 MAU)

#### EVE-63: Claude Code Subagents
- 6 strategic subagents for quality, security, and domain expertise
- Comprehensive usage documentation (SUBAGENTS.md)
- Integration guide with token cost analysis
- Manual invocation only for controlled costs (~$1.50-2.00/month)

## Known Issues

### EVE-70: TypeScript Strict Mode Errors
- 65+ errors blocking CI
- Property access errors (TS4111) - ~30 instances requiring bracket notation
- Unused parameters (TS6133) - ~10 instances
- Read-only property errors (TS2540) - ~15 instances in error classes
- Type compatibility issues in token service and route handlers
- Estimated effort: ~2-3 hours of mechanical fixes

### EVE-71: GitHub Actions Billing Lock
- Public repo Actions showing false billing error despite $0 usage
- Not a real billing problem - likely account verification needed
- Workaround: Run quality checks locally until resolved

[Unreleased]: https://github.com/UlyasPendragon/eve-online-tool/compare/v0.1.0-alpha...HEAD
[0.1.0-alpha]: https://github.com/UlyasPendragon/eve-online-tool/releases/tag/v0.1.0-alpha
