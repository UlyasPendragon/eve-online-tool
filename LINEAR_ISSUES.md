# Linear Issues Index

**Last Updated:** 2025-10-31 (Auto-maintained by Claude Code)
**Total Issues:** 81 (0 In Progress, 33 Completed, 48 Backlog)

This document provides a quick reference index of all Linear issues for the EVE Online Tool project.

**Linear Workspace:** https://linear.app/eve-online-tool
**GitHub Repository:** https://github.com/UlyasPendragon/eve-online-tool

---

## 🔄 Strategic Pivot: Mobile → Web First (2025-10-30)

**Major Development Change:**
After analyzing the EVE Online player ecosystem, we've pivoted from mobile-first to **web-first development**:

- **Rationale**: EVE players are desktop users who rely on web tools (zKillboard, DOTLAN, EVE Tycoon)
- **Strategy**: Build Next.js web MVP first (3 weeks), validate with community, then return to mobile in Phase 2
- **Code Reuse**: 60-70% of mobile business logic transferring to web (API client, hooks, stores)
- **Mobile Status**: Paused (not cancelled) - all completed work preserved for Phase 2

**New Issues:** EVE-100 to EVE-121 (22 issues for web development)

**See CLAUDE.md "Strategic Pivot" section for full rationale and implementation plan.**

---

## ✅ Completed Issues (33 issues)

### Documentation & Strategic Planning (2 completed)

#### EVE-101: Create Linear project and issues for web development
- **Completed:** 2025-10-30
- **Description:** Created "EVE Nomad Web Application" Linear project with all 22 web development issues (EVE-100 to EVE-121)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-101

#### EVE-100: Document strategic pivot from mobile to web-first development
- **Completed:** 2025-10-30
- **Description:** Updated CLAUDE.md and LINEAR_ISSUES.md with comprehensive rationale for web-first development strategy
- **Link:** https://linear.app/eve-online-tool/issue/EVE-100
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/35

### Foundation & Infrastructure (18 completed)

#### EVE-97: Create comprehensive backend testing strategy and test suite
- **Completed:** 2025-10-24
- **Description:** Designed comprehensive testing strategy with unit tests, integration tests, and E2E tests for backend
- **Link:** https://linear.app/eve-online-tool/issue/EVE-97

#### EVE-70: Fix TypeScript strict mode errors
- **Completed:** 2025-10-23
- **Description:** Resolved all TypeScript strict mode compilation errors preventing CI from passing
- **Link:** https://linear.app/eve-online-tool/issue/EVE-70
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/29

#### EVE-69: Fix race condition in character creation during OAuth flow
- **Completed:** 2025-10-22
- **Description:** Fixed race condition using Prisma atomic upsert operation
- **Link:** https://linear.app/eve-online-tool/issue/EVE-69

#### EVE-68: Add error handling for token encryption operations
- **Completed:** 2025-10-22
- **Description:** Added config validator and wrapped encryption calls in try-catch
- **Link:** https://linear.app/eve-online-tool/issue/EVE-68

#### EVE-67: Replace console.log with production-grade Pino logging
- **Completed:** 2025-10-22
- **Description:** Replaced all console.log with Pino structured logging with Sentry integration
- **Link:** https://linear.app/eve-online-tool/issue/EVE-67

#### EVE-66: Replace generic Error classes with custom domain errors
- **Completed:** 2025-10-22
- **Description:** Implemented custom domain error classes (RecordNotFoundError, ReauthRequiredError, AuthorizationError)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-66

#### EVE-65: Implement Prisma client singleton pattern
- **Completed:** 2025-10-22
- **Description:** Created getPrisma() utility to prevent connection pool exhaustion and memory leaks
- **Link:** https://linear.app/eve-online-tool/issue/EVE-65

#### EVE-64: Set up GitHub repository with version control
- **Completed:** 2025-10-22
- **Description:** Established GitHub repository with proper version control, PR templates, and Linear integration
- **Link:** https://linear.app/eve-online-tool/issue/EVE-64

#### EVE-63: Implement Claude Code Subagents for specialized development tasks
- **Completed:** 2025-10-18
- **Description:** Created 6 strategic subagents for quality, security, and domain expertise
- **Link:** https://linear.app/eve-online-tool/issue/EVE-63

#### EVE-21: Create developer onboarding documentation
- **Completed:** 2025-10-18
- **Description:** Created comprehensive setup and testing guides for backend development
- **Link:** https://linear.app/eve-online-tool/issue/EVE-21

#### EVE-20: Write comprehensive EVE SSO OAuth setup guide
- **Completed:** 2025-10-18
- **Description:** Documented complete OAuth registration and configuration process
- **Link:** https://linear.app/eve-online-tool/issue/EVE-20

#### EVE-15: Configure logging and error tracking (Sentry + Pino)
- **Completed:** 2025-10-18
- **Description:** Implemented production-grade error tracking with Sentry and structured logging with Pino
- **Link:** https://linear.app/eve-online-tool/issue/EVE-15

#### EVE-14: Set up continuous integration pipeline
- **Completed:** 2025-10-18
- **Description:** Created GitHub Actions CI workflow with lint, typecheck, test, and security checks
- **Link:** https://linear.app/eve-online-tool/issue/EVE-14

#### EVE-13: Implement ESI data caching layer with Redis
- **Completed:** 2025-10-18
- **Description:** Built caching system that stores ESI responses according to cache headers
- **Link:** https://linear.app/eve-online-tool/issue/EVE-13

#### EVE-12: Expand ESI client library with core endpoints
- **Completed:** 2025-10-18
- **Description:** Built reusable API client library for ESI calls with authentication and error handling
- **Link:** https://linear.app/eve-online-tool/issue/EVE-12

#### EVE-11: Refine database schema for MVP
- **Completed:** 2025-10-18
- **Description:** Created comprehensive Prisma schema with user accounts, characters, and sessions
- **Link:** https://linear.app/eve-online-tool/issue/EVE-11

#### EVE-10: Implement ESI OAuth authentication flow (Backend)
- **Completed:** 2025-10-18
- **Description:** Built secure OAuth authentication flow with EVE SSO for ESI data access
- **Link:** https://linear.app/eve-online-tool/issue/EVE-10

#### EVE-9: Set up development environment
- **Completed:** 2025-10-17
- **Description:** Configured development environment with Node.js + TypeScript + Fastify + PostgreSQL + Redis
- **Link:** https://linear.app/eve-online-tool/issue/EVE-9

#### EVE-7: Write Terms of Service for EVE Nomad
- **Completed:** 2025-10-17
- **Description:** Reviewed and documented CCP's Developer License Agreement requirements
- **Link:** https://linear.app/eve-online-tool/issue/EVE-7

### Mobile App - EVE Nomad (13 completed)

#### EVE-99: Mobile Authentication Critical Fixes and Improvements
- **Completed:** 2025-10-30
- **Description:** Fixed 4 critical issues: JWT code duplication, token refresh race condition, AuthGuard useEffect dependencies, login navigation timing
- **Link:** https://linear.app/eve-online-tool/issue/EVE-99
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/33

#### EVE-85: Fetch and display character list
- **Completed:** 2025-10-30
- **Description:** Character list UI with React Query, CharacterCard/CharacterList components, pull-to-refresh, loading/error/empty states
- **Link:** https://linear.app/eve-online-tool/issue/EVE-85

#### EVE-79: Create global state management with Zustand
- **Completed:** 2025-10-30
- **Description:** Zustand stores for auth, characters, and settings state management (minimal MVP)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-79

#### EVE-98: Bug: AuthGuard navigation error before router mount
- **Completed:** 2025-10-24
- **Priority:** Critical
- **Description:** Fixed "Attempted to navigate before mounting the Root Layout component" error by replacing imperative router.replace() with declarative <Redirect /> component
- **Link:** https://linear.app/eve-online-tool/issue/EVE-98
- **Branch:** fix/eve-98-authguard-navigation-error

#### EVE-84: Implement logout functionality with token cleanup (Mobile)
- **Completed:** 2025-10-24
- **Description:** Complete logout service with backend session invalidation, token removal, storage clear, and cache management
- **Link:** https://linear.app/eve-online-tool/issue/EVE-84
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/28

#### EVE-83: Implement protected route authentication guard (Mobile)
- **Completed:** 2025-10-24
- **Description:** AuthGuard component with JWT validation, automatic redirect to login with returnUrl preservation
- **Link:** https://linear.app/eve-online-tool/issue/EVE-83
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/28

#### EVE-82: Implement automatic token refresh mechanism (Mobile)
- **Completed:** 2025-10-24
- **Description:** Proactive and reactive token refresh strategies to keep users logged in
- **Link:** https://linear.app/eve-online-tool/issue/EVE-82
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/28

#### EVE-81: Create registration screen with email/password (Mobile)
- **Completed:** 2025-10-24
- **Description:** User-friendly registration screen with validation and error handling
- **Link:** https://linear.app/eve-online-tool/issue/EVE-81
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/28

#### EVE-80: Implement OAuth login with EVE SSO (Mobile)
- **Completed:** 2025-10-24
- **Description:** OAuth 2.0 authorization code flow with EVE SSO using deep linking (eveapp:// scheme)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-80
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/28

#### EVE-78: Create base UI component library
- **Completed:** 2025-10-23
- **Description:** Built comprehensive UI component library (Button, Text, LoadingSpinner, etc.)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-78

#### EVE-76: Configure Axios API client with JWT auth
- **Completed:** 2025-10-23
- **Description:** Set up Axios client with automatic JWT token injection and error handling
- **Link:** https://linear.app/eve-online-tool/issue/EVE-76

#### EVE-75: Configure React Query for server state management
- **Completed:** 2025-10-23
- **Description:** Set up TanStack Query v5 for efficient API data fetching and caching
- **Link:** https://linear.app/eve-online-tool/issue/EVE-75

#### EVE-74: Set up Expo Router for file-based navigation
- **Completed:** 2025-10-23
- **Description:** Implemented file-based routing using Expo Router
- **Link:** https://linear.app/eve-online-tool/issue/EVE-74

#### EVE-72: Initialize React Native project with Expo
- **Completed:** 2025-10-23
- **Description:** Set up initial Expo project with TypeScript configuration for EVE Nomad Mobile app
- **Link:** https://linear.app/eve-online-tool/issue/EVE-72

---

## 📋 Backlog (26 issues)
## 📋 Backlog (48 issues)

### Foundation & Infrastructure (6 backlog)

#### EVE-71: GitHub Actions billing lock preventing CI from running
- **Created:** 2025-10-22
- **Priority:** Bug
- **Description:** GitHub Actions billing lock error preventing CI workflows from running
- **Link:** https://linear.app/eve-online-tool/issue/EVE-71

#### EVE-61: Seek CCP clarification on gray area compliance items
- **Created:** 2025-10-17
- **Description:** Request official clarification from CCP on character limits, historical data, and aggregation analytics
- **Link:** https://linear.app/eve-online-tool/issue/EVE-61

#### EVE-39: Create analytics and metrics tracking system
- **Created:** 2025-10-17
- **Description:** Implement comprehensive analytics to track user behavior, performance, and business metrics
- **Link:** https://linear.app/eve-online-tool/issue/EVE-39

#### EVE-36: Build subscription management and billing system
- **Created:** 2025-10-17
- **Description:** Implement complete subscription system with Stripe for free and paid tiers
- **Link:** https://linear.app/eve-online-tool/issue/EVE-36

#### EVE-19: Implement user account management system
- **Created:** 2025-10-17
- **Description:** Build complete user account system with registration, login, password management, 2FA
- **Link:** https://linear.app/eve-online-tool/issue/EVE-19

#### EVE-8: Apply for EVE Partner Program
- **Created:** 2025-10-17
- **Description:** Apply for acceptance into CCP's EVE Partner Program (target after 1,000+ MAU)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-8

### Mobile App - Frontend Setup (2 backlog)

#### EVE-77: Implement secure token storage with MMKV
- **Created:** 2025-10-23
- **Description:** Set up secure, encrypted storage for JWT tokens and sensitive user data
- **Link:** https://linear.app/eve-online-tool/issue/EVE-77

#### EVE-73: Configure ESLint, Prettier, and strict TypeScript
- **Created:** 2025-10-23
- **Description:** Set up code quality tooling for consistent formatting and type safety
- **Link:** https://linear.app/eve-online-tool/issue/EVE-73

### Mobile App - Character Management (4 backlog)

#### EVE-86: Implement character switcher functionality
- **Created:** 2025-10-23
- **Description:** Build character switcher component for multi-character support. Store active character in Zustand, persist with MMKV
- **Link:** https://linear.app/eve-online-tool/issue/EVE-86

#### EVE-87: Create character detail view
- **Created:** 2025-10-23
- **Description:** Build character detail screen with comprehensive profile, stats, and associated data (wallet, skills, market orders)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-87

#### EVE-89: Implement remove character functionality
- **Created:** 2025-10-23
- **Description:** Allow users to unlink characters from their account with proper confirmation
- **Link:** https://linear.app/eve-online-tool/issue/EVE-89

#### EVE-88: Implement add character via OAuth
- **Created:** 2025-10-23
- **Description:** Allow users to link additional EVE characters via EVE SSO OAuth
- **Link:** https://linear.app/eve-online-tool/issue/EVE-88

### Mobile App - Skills & Dashboard (5 backlog)

#### EVE-95: Create dashboard home screen with widget layout
- **Created:** 2025-10-23
- **Description:** Build main dashboard screen showing overview widgets (skills, wallet, market, character)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-95

#### EVE-94: Implement freemium feature gating system
- **Created:** 2025-10-23
- **Description:** Create feature gating system to restrict premium features to subscribed users
- **Link:** https://linear.app/eve-online-tool/issue/EVE-94

#### EVE-93: Build skills tab with completed skills browser
- **Created:** 2025-10-23
- **Description:** Create comprehensive skills screen showing trained skills, categories, and statistics
- **Link:** https://linear.app/eve-online-tool/issue/EVE-93

#### EVE-92: Create skill completion push notification system
- **Created:** 2025-10-23
- **Description:** Send push notifications when skills complete training (Premium feature)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-92

#### EVE-91: Implement real-time skill training progress
- **Created:** 2025-10-23
- **Description:** Show live skill training progress that updates in real-time without constant API calls
- **Link:** https://linear.app/eve-online-tool/issue/EVE-91

#### EVE-90: Build skill queue display component
- **Created:** 2025-10-23
- **Description:** Create UI component to display active character's skill queue with training progress
- **Link:** https://linear.app/eve-online-tool/issue/EVE-90

### Mobile App - Freemium & Subscriptions (3 backlog)

#### EVE-47: Design free tier optimization to drive conversions
- **Created:** 2025-10-17
- **⚠️ CCP Compliance:** Requires CCP clarification on character limits
- **Description:** Optimize free tier experience to showcase app value while creating natural upgrade moments
- **Link:** https://linear.app/eve-online-tool/issue/EVE-47

#### EVE-46: Implement subscription management portal
- **Created:** 2025-10-17
- **Description:** Create web-based portal where users can view and manage subscriptions, billing, and account
- **Link:** https://linear.app/eve-online-tool/issue/EVE-46

#### EVE-43: Design and implement subscription upgrade flow
- **Created:** 2025-10-17
- **Description:** Create smooth, compelling upgrade experience that converts free users to paid subscribers
- **Link:** https://linear.app/eve-online-tool/issue/EVE-43

### Web App - EVE Nomad (20 backlog)

#### Foundation (3 backlog)

##### EVE-104: Update backend CORS for web client
- **Created:** 2025-10-30
- **Estimate:** 2 hours
- **Description:** Update CORS configuration in eve-nomad-backend to allow requests from web client (localhost:3001 and production domain)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-104

##### EVE-103: Copy and adapt reusable code from mobile
- **Created:** 2025-10-30
- **Estimate:** 6 hours
- **Description:** Migrate business logic from mobile to web (API client, React Query hooks, Zustand stores, type definitions, utilities)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-103

##### EVE-102: Initialize Next.js 15 web project
- **Created:** 2025-10-30
- **Estimate:** 4 hours
- **Description:** Create eve-nomad-web/ directory with Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, Zustand, React Query, Axios
- **Link:** https://linear.app/eve-online-tool/issue/EVE-102

#### Authentication (5 backlog)

##### EVE-109: Implement logout functionality
- **Created:** 2025-10-30
- **Estimate:** 3 hours
- **Description:** Clear authentication state, call backend logout endpoint, redirect to login page
- **Link:** https://linear.app/eve-online-tool/issue/EVE-109

##### EVE-108: Implement registration page
- **Created:** 2025-10-30
- **Estimate:** 4 hours
- **Description:** Create registration form with email/password validation and error handling
- **Link:** https://linear.app/eve-online-tool/issue/EVE-108

##### EVE-107: Implement OAuth callback handler
- **Created:** 2025-10-30
- **Estimate:** 6 hours
- **Description:** Extract JWT from query parameters, save to localStorage, update stores, handle errors, redirect to dashboard
- **Link:** https://linear.app/eve-online-tool/issue/EVE-107

##### EVE-106: Implement OAuth login page
- **Created:** 2025-10-30
- **Estimate:** 4 hours
- **Description:** Create login page with "Login with EVE Online" button that redirects to backend OAuth endpoint
- **Link:** https://linear.app/eve-online-tool/issue/EVE-106

##### EVE-105: Create Next.js middleware for route protection
- **Created:** 2025-10-30
- **Estimate:** 4 hours
- **Description:** Implement Next.js 15 middleware to protect routes from unauthenticated access
- **Link:** https://linear.app/eve-online-tool/issue/EVE-105

#### UI Components (4 backlog)

##### EVE-113: Create custom CharacterList component
- **Created:** 2025-10-30
- **Estimate:** 3 hours
- **Description:** Build CharacterList component with grid layout, loading/error/empty states
- **Link:** https://linear.app/eve-online-tool/issue/EVE-113

##### EVE-112: Create custom CharacterCard component
- **Created:** 2025-10-30
- **Estimate:** 4 hours
- **Description:** Convert mobile CharacterCard to web component with hover states and click handling
- **Link:** https://linear.app/eve-online-tool/issue/EVE-112

##### EVE-111: Create EVE-themed CSS design system
- **Created:** 2025-10-30
- **Estimate:** 4 hours
- **Description:** Convert mobile theme.ts to CSS variables (colors, typography, spacing, effects)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-111

##### EVE-110: Install and configure shadcn/ui
- **Created:** 2025-10-30
- **Estimate:** 3 hours
- **Description:** Install shadcn/ui with EVE-themed colors and configure base components
- **Link:** https://linear.app/eve-online-tool/issue/EVE-110

#### Dashboard Features (5 backlog)

##### EVE-118: Implement wallet and market pages
- **Created:** 2025-10-30
- **Estimate:** 8 hours
- **Description:** Create wallet page (balance, transactions) and market page (orders, history)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-118

##### EVE-117: Implement skills page with queue display
- **Created:** 2025-10-30
- **Estimate:** 8 hours
- **Description:** Display skill queue with real-time training progress and completed skills browser
- **Link:** https://linear.app/eve-online-tool/issue/EVE-117

##### EVE-116: Implement character detail page
- **Created:** 2025-10-30
- **Estimate:** 6 hours
- **Description:** Create dynamic route /characters/[id] showing character profile, stats, and data
- **Link:** https://linear.app/eve-online-tool/issue/EVE-116

##### EVE-115: Implement characters page
- **Created:** 2025-10-30
- **Estimate:** 6 hours
- **Description:** Use CharacterList component to display user's characters with refresh functionality
- **Link:** https://linear.app/eve-online-tool/issue/EVE-115

##### EVE-114: Create dashboard layout with navigation
- **Created:** 2025-10-30
- **Estimate:** 6 hours
- **Description:** Build main dashboard layout with sidebar/header navigation, character switcher, logout button
- **Link:** https://linear.app/eve-online-tool/issue/EVE-114

#### Deployment (3 backlog)

##### EVE-121: Update documentation and Linear tracking
- **Created:** 2025-10-30
- **Estimate:** 3 hours
- **Description:** Update CLAUDE.md, LINEAR_ISSUES.md, create completion comment on EVE-101, mark all web issues as Done
- **Link:** https://linear.app/eve-online-tool/issue/EVE-121

##### EVE-120: Deploy to Vercel production
- **Created:** 2025-10-30
- **Estimate:** 4 hours
- **Description:** Deploy web app to Vercel, configure environment variables, register OAuth callback with CCP
- **Link:** https://linear.app/eve-online-tool/issue/EVE-120

##### EVE-119: End-to-end testing and bug fixes
- **Created:** 2025-10-30
- **Estimate:** 8 hours
- **Description:** Comprehensive testing of all features (auth flow, navigation, data fetching, error handling)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-119

### Community & Marketing (4 backlog)

#### EVE-58: Create regular update and release cadence
- **Created:** 2025-10-17
- **Description:** Establish predictable, sustainable release schedule to maintain user trust
- **Link:** https://linear.app/eve-online-tool/issue/EVE-58

#### EVE-56: Implement user feedback collection and analysis system
- **Created:** 2025-10-17
- **Description:** Create systematic processes for collecting, analyzing, and acting on user feedback
- **Link:** https://linear.app/eve-online-tool/issue/EVE-56

#### EVE-55: Plan and execute public launch
- **Created:** 2025-10-17
- **Description:** Execute coordinated public launch of EVE Nomad to maximize visibility
- **Link:** https://linear.app/eve-online-tool/issue/EVE-55

#### EVE-50: Set up closed beta program
- **Created:** 2025-10-17
- **Description:** Launch closed beta program to test EVE Nomad with real users before public release
- **Link:** https://linear.app/eve-online-tool/issue/EVE-50

### Documentation

#### EVE-96: Frontend initialization complete - EVE Nomad Mobile project ready
- **Created:** 2025-10-23
- **Description:** Successfully initialized the EVE Nomad Mobile frontend project with complete development infrastructure
- **Link:** https://linear.app/eve-online-tool/issue/EVE-96

---

## 📊 Statistics

### Overall Progress
- **Total Issues:** 57
- **Completed:** 31 issues (54%)
- **In Progress:** 0 issues (0%)
- **Backlog:** 26 issues (46%)

### By Project
- **Foundation & Infrastructure:** 24 issues (18 completed, 6 backlog)
- **EVE Nomad Mobile:** 29 issues (13 completed, 0 in progress, 16 backlog)
- **Total Issues:** 78
- **Completed:** 30 issues (38%)
- **In Progress:** 0 issues (0%)
- **Backlog:** 48 issues (62%)

### By Project
- **Foundation & Infrastructure:** 24 issues (18 completed, 6 backlog)
- **EVE Nomad Mobile (Paused):** 28 issues (10 completed, 18 backlog)
- **EVE Nomad Web (Active):** 22 issues (2 completed, 20 backlog)
- **Community & Marketing:** 4 issues (all backlog)

### By Phase
- **Phase 1: Foundation** - 75% complete (18/24 issues)
- **Phase 2: Mobile MVP** - 45% complete (13/29 issues)
- **Phase 3: Community** - 0% complete (0/4 issues)

### Recent Velocity
- **Last 7 days:** 9 issues completed (EVE-79, 80, 81, 82, 83, 84, 85, 98, 99)
- **State management:** Complete (EVE-79 Zustand stores)
- **Authentication phase:** Complete (EVE-80 through EVE-84)
- **Bug fixes:** EVE-98 (AuthGuard navigation error) resolved
- **Code quality improvements:** EVE-99 (4 critical fixes) resolved
- **Current focus:** Ready for feature implementation (character management next)
- **Phase 2a: Mobile MVP (Paused)** - 36% complete (10/28 issues)
- **Phase 2b: Web MVP (Active)** - 9% complete (2/22 issues)
- **Phase 3: Community** - 0% complete (0/4 issues)

### Recent Velocity
- **Last 7 days:** 8 issues completed (EVE-80, 81, 82, 83, 84, 98, 100, 101)
- **Authentication phase:** Complete (EVE-80 through EVE-84)
- **Strategic pivot:** Web-first development initiated (EVE-100, EVE-101)
- **Current focus:** Web application initialization (EVE-102 next)

---

## 🎯 Current Development Status

### Active Work
- **Status:** 🟢 Ready for next feature
- **Branch:** `feature/eve-85-mobile-auth-improvements` (PR #33 pending)
- **Last Completed:** EVE-99 (Mobile Authentication Critical Fixes)

### Recently Completed
- ✅ **Critical Authentication Fixes** (EVE-99, Oct 30)
  - Created centralized JWT utility module (eliminated 150+ lines duplication)
  - Fixed token refresh race condition with promise deduplication
  - Fixed AuthGuard useEffect dependencies (React best practices)
  - Fixed login navigation timing with try-catch pattern
  - All TypeScript checks passing (0 errors)

- ✅ **State Management** (EVE-79, Oct 30)
  - Zustand stores for auth, characters, settings
  - Integration with login/logout flows
  - AuthGuard uses centralized auth state
  - Type-safe hooks with TypeScript

- ✅ **Documentation Infrastructure** (PR #31, Oct 24)
  - LINEAR_ISSUES.md issue index
  - CLAUDE_CODE_WORKFLOW.md workflow guidelines

- ✅ **Complete authentication system** (EVE-80 through EVE-84)
  - OAuth login with EVE SSO
  - Registration with validation
  - Automatic token refresh
  - Protected route guards
  - Logout with complete cleanup

### Next Up (Awaiting Direction)
Options for next development phase:
1. **Character Management** (EVE-85 through EVE-89) - UI implementation with mock data (recommended)
2. **Skill Queue** (EVE-90, 91) - Display and real-time progress
3. **Dashboard** (EVE-95) - Widget-based overview screen
4. **MMKV Persistence** (EVE-77) - Add persistent storage to Zustand stores
5. **Other priorities** - Backend features, infrastructure, etc.
- **Status:** 🌐 Web MVP Development (Phase 2b Active)
- **Branch:** `docs/eve-100-strategic-pivot-documentation` (PR #35 open)
- **Last PR:** #35 (Open) - Strategic Pivot Documentation

### Recently Completed
- ✅ **Strategic Pivot to Web-First** (EVE-100, EVE-101, Oct 30)
  - Comprehensive analysis and documentation
  - Linear project with 22 web development issues
  - CLAUDE.md and LINEAR_ISSUES.md updated

- ✅ **Mobile Authentication System** (EVE-80 through EVE-84, Oct 24)
  - Production-ready authentication (paused, not cancelled)
  - OAuth, registration, token refresh, route guards, logout
  - All code preserved for Phase 2 mobile return

### Next Up
**Immediate:** EVE-102 - Initialize Next.js 15 web project (4 hours)
- Create `eve-nomad-web/` directory
- Install Next.js 15 with App Router
- Configure TypeScript, Tailwind, shadcn/ui
- Set up Zustand, React Query, Axios

**Following:** 3-week web MVP sprint (EVE-102 to EVE-121)
1. Foundation (EVE-102-104) - 12 hours
2. Authentication (EVE-105-109) - 21 hours
3. UI Components (EVE-110-113) - 14 hours
4. Dashboard Features (EVE-114-118) - 34 hours
5. Deployment (EVE-119-121) - 15 hours

**Total Estimate:** 96 hours (~3 weeks at 30-35 hours/week)

---

## 📝 Notes

- This file is automatically maintained by Claude Code
- All dates in YYYY-MM-DD format
- Links point to Linear workspace issues
- File updated after every work session and status change
- **State management complete** - Zustand stores ready for use (EVE-79)
- **Authentication system complete** - Ready for feature development
- **Mock data strategy** - Building UI first, backend integration later
- **Strategic Pivot (2025-10-30):** Switched from mobile-first to web-first development
- **Mobile Work Preserved:** All mobile authentication work (EVE-80 to EVE-84) saved for Phase 2
- **Web MVP Active:** 22 new issues created (EVE-100 to EVE-121) for 3-week sprint
- **Next Milestone:** Deploy functional web application to Vercel, validate with EVE community

---

**Maintained by:** Claude Code
**Project:** EVE Online Tool
**Linear Workspace:** https://linear.app/eve-online-tool
**GitHub Repository:** https://github.com/UlyasPendragon/eve-online-tool
