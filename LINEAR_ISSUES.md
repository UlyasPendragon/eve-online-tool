# Linear Issues Index

**Last Updated:** 2025-10-30 (Auto-maintained by Claude Code)
**Total Issues:** 56 (0 In Progress, 28 Completed, 28 Backlog)

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

## ✅ Completed Issues (28 issues)

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

### Mobile App - EVE Nomad (10 completed)

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

## 📋 Backlog (25 issues)

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

### Mobile App - Frontend Setup (3 backlog)

#### EVE-79: Create global state management with Zustand
- **Created:** 2025-10-23
- **Description:** Set up Zustand for client-side state management (auth, active character, app settings)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-79

#### EVE-77: Implement secure token storage with MMKV
- **Created:** 2025-10-23
- **Description:** Set up secure, encrypted storage for JWT tokens and sensitive user data
- **Link:** https://linear.app/eve-online-tool/issue/EVE-77

#### EVE-73: Configure ESLint, Prettier, and strict TypeScript
- **Created:** 2025-10-23
- **Description:** Set up code quality tooling for consistent formatting and type safety
- **Link:** https://linear.app/eve-online-tool/issue/EVE-73

### Mobile App - Character Management (5 backlog)

#### EVE-85: Fetch and display character list
- **Created:** 2025-10-23
- **Description:** Create API wrapper and UI for displaying user's characters with mock data strategy for rapid UI development
- **Link:** https://linear.app/eve-online-tool/issue/EVE-85

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
- **Total Issues:** 56
- **Completed:** 28 issues (50%)
- **In Progress:** 0 issues (0%)
- **Backlog:** 28 issues (50%)

### By Project
- **Foundation & Infrastructure:** 24 issues (18 completed, 6 backlog)
- **EVE Nomad Mobile:** 28 issues (10 completed, 0 in progress, 18 backlog)
- **Community & Marketing:** 4 issues (all backlog)

### By Phase
- **Phase 1: Foundation** - 75% complete (18/24 issues)
- **Phase 2: Mobile MVP** - 36% complete (10/28 issues)
- **Phase 3: Community** - 0% complete (0/4 issues)

### Recent Velocity
- **Last 7 days:** 6 issues completed (EVE-80, 81, 82, 83, 84, 98)
- **Authentication phase:** Complete (EVE-80 through EVE-84)
- **Bug fixes:** EVE-98 (AuthGuard navigation error) resolved
- **Current focus:** Ready for feature implementation (core auth system stable)

---

## 🎯 Current Development Status

### Active Work
- **Status:** 🟢 Ready for next feature
- **Branch:** `main` (clean, all docs merged)
- **Last PR:** #31 (Merged) - Documentation: LINEAR_ISSUES.md + Claude Code Workflow

### Recently Completed
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
1. **Character Management** (EVE-85 through EVE-89) - UI implementation with mock data
2. **Skill Queue** (EVE-90, 91) - Display and real-time progress
3. **Dashboard** (EVE-95) - Widget-based overview screen
4. **Other priorities** - Backend features, infrastructure, etc.

---

## 📝 Notes

- This file is automatically maintained by Claude Code
- All dates in YYYY-MM-DD format
- Links point to Linear workspace issues
- File updated after every work session and status change
- **Authentication system complete** - Ready for feature development
- **Mock data strategy** - Building UI first, backend integration later

---

**Maintained by:** Claude Code
**Project:** EVE Online Tool
**Linear Workspace:** https://linear.app/eve-online-tool
**GitHub Repository:** https://github.com/UlyasPendragon/eve-online-tool
