# Linear Issues Index

**Last Updated:** 2025-01-24 (Auto-maintained by Claude Code)
**Total Issues:** 60 (3 In Progress, 23 Completed, 34 Backlog)

---

## 🚧 In Progress

### EVE-80: Implement EVE SSO OAuth login flow
- **Status:** In Progress
- **Project:** EVE Nomad - Mobile Companion App
- **Assignee:** Curtis Reker
- **Created:** 2025-10-23
- **Description:** Implement OAuth 2.0 authorization code flow with EVE SSO for user authentication
- **Link:** https://linear.app/eve-online-tool/issue/EVE-80
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/28

### EVE-81: Build login and registration screens
- **Status:** In Progress
- **Project:** EVE Nomad - Mobile Companion App
- **Assignee:** Curtis Reker
- **Created:** 2025-10-23
- **Description:** Create user-friendly login and registration screens with email/password and EVE SSO options
- **Link:** https://linear.app/eve-online-tool/issue/EVE-81
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/28

### EVE-82: Implement automatic token refresh mechanism
- **Status:** In Progress
- **Project:** EVE Nomad - Mobile Companion App
- **Assignee:** Curtis Reker
- **Created:** 2025-10-23
- **Description:** Build automatic JWT token refresh to keep users logged in without manual re-authentication
- **Link:** https://linear.app/eve-online-tool/issue/EVE-82
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/28

---

## ✅ Completed Issues

### Foundation & Infrastructure (16 completed)

#### EVE-78: Set up React Query for server state management
- **Completed:** 2025-10-23
- **Description:** Configure TanStack Query for efficient API data fetching and caching
- **Link:** https://linear.app/eve-online-tool/issue/EVE-78

#### EVE-76: Configure environment variables and API client
- **Completed:** 2025-10-23
- **Description:** Set up environment configuration and create API client for backend communication
- **Link:** https://linear.app/eve-online-tool/issue/EVE-76

#### EVE-75: Create EVE-themed design system and UI components
- **Completed:** 2025-10-23
- **Description:** Build comprehensive design system with EVE Online-themed colors and reusable UI components
- **Link:** https://linear.app/eve-online-tool/issue/EVE-75

#### EVE-74: Set up Expo Router for file-based navigation
- **Completed:** 2025-10-23
- **Description:** Implement file-based routing using Expo Router for app navigation structure
- **Link:** https://linear.app/eve-online-tool/issue/EVE-74

#### EVE-72: Initialize Expo project with TypeScript
- **Completed:** 2025-10-23
- **Description:** Set up initial Expo project with TypeScript configuration for EVE Nomad Mobile app
- **Link:** https://linear.app/eve-online-tool/issue/EVE-72

#### EVE-70: Fix TypeScript strict mode errors
- **Completed:** 2025-10-23
- **Description:** Resolve all TypeScript strict mode compilation errors preventing CI from passing
- **Link:** https://linear.app/eve-online-tool/issue/EVE-70
- **PR:** https://github.com/UlyasPendragon/eve-online-tool/pull/29

#### EVE-69: CRITICAL - Fix race condition in character creation
- **Completed:** 2025-10-22
- **Description:** Fixed race condition using Prisma atomic upsert operation
- **Link:** https://linear.app/eve-online-tool/issue/EVE-69

#### EVE-68: CRITICAL - Add error handling for token encryption
- **Completed:** 2025-10-22
- **Description:** Added config validator and wrapped encryption calls in try-catch
- **Link:** https://linear.app/eve-online-tool/issue/EVE-68

#### EVE-67: CRITICAL - Replace console.log with Pino logger
- **Completed:** 2025-10-22
- **Description:** Replaced all console.log with Pino structured logging
- **Link:** https://linear.app/eve-online-tool/issue/EVE-67

#### EVE-66: CRITICAL - Replace generic Error classes
- **Completed:** 2025-10-22
- **Description:** Implemented custom domain error classes (RecordNotFoundError, etc.)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-66

#### EVE-65: CRITICAL - Refactor to use shared Prisma client
- **Completed:** 2025-10-22
- **Description:** Created getPrisma() utility to prevent connection pool exhaustion
- **Link:** https://linear.app/eve-online-tool/issue/EVE-65

#### EVE-64: Set up GitHub repository and version control
- **Completed:** 2025-10-22
- **Description:** Establish GitHub repository with proper version control and collaboration workflows
- **Link:** https://linear.app/eve-online-tool/issue/EVE-64

#### EVE-63: Implement Strategic Claude Code Subagents
- **Completed:** 2025-10-18
- **Description:** Created 6 high-value, token-efficient subagents for quality & security
- **Link:** https://linear.app/eve-online-tool/issue/EVE-63

#### EVE-62: Fix OAuth token verification 404 error
- **Completed:** 2025-10-18
- **Description:** Fixed incorrect ESI endpoint URL in token verification service
- **Link:** https://linear.app/eve-online-tool/issue/EVE-62

#### EVE-38: Implement background job processing system
- **Completed:** 2025-10-18
- **Description:** Created robust background job system with BullMQ for asynchronous tasks
- **Link:** https://linear.app/eve-online-tool/issue/EVE-38

#### EVE-18: Set up error tracking and logging system
- **Completed:** 2025-10-18
- **Description:** Implemented comprehensive error tracking with Sentry and Pino logging
- **Link:** https://linear.app/eve-online-tool/issue/EVE-18

#### EVE-13: Implement ESI data caching layer
- **Completed:** 2025-10-18
- **Description:** Built caching system that stores ESI responses according to cache headers
- **Link:** https://linear.app/eve-online-tool/issue/EVE-13

#### EVE-12: Create basic ESI API client library
- **Completed:** 2025-10-18
- **Description:** Built reusable API client library for ESI calls with authentication and error handling
- **Link:** https://linear.app/eve-online-tool/issue/EVE-12

#### EVE-11: Design and implement database schema
- **Completed:** 2025-10-18
- **Description:** Created comprehensive Prisma schema with 7 models for user accounts and data
- **Link:** https://linear.app/eve-online-tool/issue/EVE-11

#### EVE-10: Implement ESI OAuth authentication system
- **Completed:** 2025-10-18
- **Description:** Built secure OAuth authentication flow with EVE SSO for ESI data access
- **Link:** https://linear.app/eve-online-tool/issue/EVE-10

#### EVE-9: Set up development environment for ESI integration
- **Completed:** 2025-10-17
- **Description:** Configured local and production development environments with Node.js + TypeScript stack
- **Link:** https://linear.app/eve-online-tool/issue/EVE-9

#### EVE-7: Review CCP Developer License Agreement
- **Completed:** 2025-10-17
- **Description:** Thoroughly reviewed and documented CCP's Developer License Agreement requirements
- **Link:** https://linear.app/eve-online-tool/issue/EVE-7

---

## 📋 Backlog Issues

### Critical Issues

#### EVE-97: Fix Critical ESI Integration Issues
- **Status:** Backlog
- **Priority:** CRITICAL
- **Created:** 2025-10-23
- **Description:** 5 critical ESI issues blocking core functionality (private get() method, missing pagination, console.log usage, etc.)
- **Link:** https://linear.app/eve-online-tool/issue/EVE-97
- **GitHub:** https://github.com/UlyasPendragon/eve-online-tool/issues/30

#### EVE-71: GitHub Actions billing lock preventing CI
- **Status:** Backlog
- **Created:** 2025-10-22
- **Description:** GitHub Actions billing lock error preventing CI workflows from running
- **Link:** https://linear.app/eve-online-tool/issue/EVE-71
- **GitHub:** https://github.com/UlyasPendragon/eve-online-tool/issues/2

### Foundation & Infrastructure (7 backlog)

#### EVE-61: Seek CCP clarification on gray area compliance items
- **Created:** 2025-10-17
- **Description:** Request official clarification from CCP on character limits, historical data, and other gray areas
- **Link:** https://linear.app/eve-online-tool/issue/EVE-61

#### EVE-59: Monitor and optimize key business metrics
- **Created:** 2025-10-17
- **Description:** Establish continuous monitoring of KPIs to ensure business sustainability
- **Link:** https://linear.app/eve-online-tool/issue/EVE-59

#### EVE-39: Create analytics and metrics tracking system
- **Created:** 2025-10-17
- **Description:** Implement comprehensive analytics to track user behavior and app performance
- **Link:** https://linear.app/eve-online-tool/issue/EVE-39

#### EVE-36: Build subscription management and billing system
- **Created:** 2025-10-17
- **Description:** Implement complete subscription system with Stripe for free and paid tiers
- **Link:** https://linear.app/eve-online-tool/issue/EVE-36

#### EVE-19: Implement user account management system
- **Created:** 2025-10-17
- **Description:** Build complete user account system with registration, login, and profile management
- **Link:** https://linear.app/eve-online-tool/issue/EVE-19

#### EVE-8: Apply for EVE Partner Program
- **Created:** 2025-10-17
- **Description:** Apply for acceptance into CCP's EVE Partner Program for legitimacy and visibility
- **Link:** https://linear.app/eve-online-tool/issue/EVE-8

### EVE Nomad Mobile App - Authentication Phase (3 backlog)

#### EVE-84: Build logout functionality with token cleanup
- **Created:** 2025-10-23
- **Description:** Implement secure logout that clears all tokens and session data
- **Link:** https://linear.app/eve-online-tool/issue/EVE-84

#### EVE-83: Create protected route authentication guard
- **Created:** 2025-10-23
- **Description:** Implement route protection to prevent unauthenticated access to app features
- **Link:** https://linear.app/eve-online-tool/issue/EVE-83

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

### EVE Nomad Mobile App - Character Management (5 backlog)

#### EVE-89: Implement remove character functionality
- **Created:** 2025-10-23
- **Description:** Allow users to unlink characters from their account with proper confirmation
- **Link:** https://linear.app/eve-online-tool/issue/EVE-89

#### EVE-88: Implement add character via OAuth
- **Created:** 2025-10-23
- **Description:** Allow users to link additional EVE characters via EVE SSO OAuth
- **Link:** https://linear.app/eve-online-tool/issue/EVE-88

#### EVE-87: Create character detail view
- **Created:** 2025-10-23
- **Description:** Build comprehensive character detail screen showing profile, stats, and account info
- **Link:** https://linear.app/eve-online-tool/issue/EVE-87

#### EVE-86: Implement character switcher functionality
- **Created:** 2025-10-23
- **Description:** Allow users to switch between multiple characters and update active character context
- **Link:** https://linear.app/eve-online-tool/issue/EVE-86

#### EVE-85: Fetch and display character list
- **Created:** 2025-10-23
- **Description:** Retrieve and display all EVE characters linked to the user's account
- **Link:** https://linear.app/eve-online-tool/issue/EVE-85

### EVE Nomad Mobile App - Skills & Dashboard (5 backlog)

#### EVE-95: Create dashboard home screen with widget layout
- **Created:** 2025-10-23
- **Description:** Build main dashboard screen showing overview widgets for key character information
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

### EVE Nomad Mobile App - Paid Tier Features (4 backlog)

#### EVE-30: [Paid Tier] Create Industry & PI dashboard
- **Created:** 2025-10-17
- **Description:** Build consolidated dashboard for monitoring manufacturing jobs and Planetary Interaction
- **Link:** https://linear.app/eve-online-tool/issue/EVE-30

#### EVE-29: [Paid Tier] Build advanced asset browser
- **Created:** 2025-10-17
- **Description:** Create powerful, searchable asset browser showing all items across all characters
- **Link:** https://linear.app/eve-online-tool/issue/EVE-29

#### EVE-28: [Paid Tier] Create market order management interface
- **Created:** 2025-10-17
- **Description:** Allow users to view and manage market orders from mobile
- **Link:** https://linear.app/eve-online-tool/issue/EVE-28

#### EVE-27: [Paid Tier] Build full EVE Mail client
- **Created:** 2025-10-17
- **Description:** Create complete, functional EVE Mail client for reading, composing, and managing in-game mail
- **Link:** https://linear.app/eve-online-tool/issue/EVE-27

### EVE Nomad Mobile App - Freemium Implementation (4 backlog)

#### EVE-47: Design free tier optimization to drive conversions
- **Created:** 2025-10-17
- **Description:** Optimize free tier experience to showcase app value while creating natural upgrade moments
- **CCP Compliance:** Requires CCP clarification on character limits
- **Link:** https://linear.app/eve-online-tool/issue/EVE-47

#### EVE-46: Implement subscription management portal
- **Created:** 2025-10-17
- **Description:** Create web-based portal where users can view and manage subscriptions, billing, and account
- **Link:** https://linear.app/eve-online-tool/issue/EVE-46

#### EVE-43: Design and implement subscription upgrade flow
- **Created:** 2025-10-17
- **Description:** Create smooth, compelling upgrade experience that converts free users to paid subscribers
- **Link:** https://linear.app/eve-online-tool/issue/EVE-43

#### EVE-42: Implement feature access control based on subscription tier
- **Created:** 2025-10-17
- **Description:** Create robust system to enforce feature access based on user subscription tier
- **Link:** https://linear.app/eve-online-tool/issue/EVE-42

### EVE Nomad Mobile App - Deployment & CI/CD (2 backlog)

#### EVE-58: Create regular update and release cadence
- **Created:** 2025-10-17
- **Description:** Establish predictable, sustainable release schedule to maintain user trust
- **Link:** https://linear.app/eve-online-tool/issue/EVE-58

#### EVE-57: Establish continuous integration and deployment pipeline
- **Created:** 2025-10-17
- **Description:** Create automated CI/CD pipeline for rapid, reliable updates to mobile apps and backend
- **Link:** https://linear.app/eve-online-tool/issue/EVE-57

### Community & Marketing (6 backlog)

#### EVE-60: Plan post-launch feature iterations based on feedback
- **Created:** 2025-10-17
- **Description:** Create systematic process for prioritizing and implementing post-launch features
- **Link:** https://linear.app/eve-online-tool/issue/EVE-60

#### EVE-56: Implement user feedback collection and analysis system
- **Created:** 2025-10-17
- **Description:** Create systematic processes for collecting, analyzing, and acting on user feedback
- **Link:** https://linear.app/eve-online-tool/issue/EVE-56

#### EVE-55: Plan and execute public launch
- **Created:** 2025-10-17
- **Description:** Execute coordinated public launch of EVE Nomad to maximize visibility
- **Link:** https://linear.app/eve-online-tool/issue/EVE-55

#### EVE-54: Launch website and landing page
- **Created:** 2025-10-17
- **Description:** Create professional website and optimized landing page for EVE Nomad
- **Link:** https://linear.app/eve-online-tool/issue/EVE-54

#### EVE-50: Set up closed beta program
- **Created:** 2025-10-17
- **Description:** Launch closed beta program to test EVE Nomad with real users before public release
- **Link:** https://linear.app/eve-online-tool/issue/EVE-50

### Documentation & Reference

#### EVE-96: Frontend initialization complete
- **Created:** 2025-10-23
- **Description:** Successfully initialized the EVE Nomad Mobile frontend project with complete development infrastructure
- **Link:** https://linear.app/eve-online-tool/issue/EVE-96

---

## 📊 Statistics

### Overall Progress
- **Total Issues:** 60
- **Completed:** 23 issues (38%)
- **In Progress:** 3 issues (5%)
- **Backlog:** 34 issues (57%)

### By Project
- **Foundation & Infrastructure:** 23 issues (16 completed, 7 backlog)
- **EVE Nomad Mobile:** 31 issues (7 completed, 3 in progress, 21 backlog)
- **Community & Marketing:** 6 issues (all backlog)

### By Priority
- **Critical:** 2 issues (EVE-97, EVE-71)
- **High:** Authentication phase (EVE-80, EVE-81, EVE-82)
- **Medium:** Character management, Skills & Dashboard
- **Low:** Post-launch features, Community & Marketing

### Recent Velocity
- **Last 7 days:** 6 issues completed
- **Last 30 days:** 23 issues completed
- **Average completion rate:** ~1 issue per day (when actively working)

---

## 🏷️ Issues by Type

### Features (35 issues)
Foundation, ESI integration, user accounts, mobile app features, paid tier features

### Improvements (6 issues)
EVE-63 (Subagents), EVE-65, EVE-66, EVE-67, EVE-68, EVE-8

### Fixes (4 issues)
EVE-69, EVE-70, EVE-71, EVE-62, EVE-97

### Setup/Infrastructure (15 issues)
EVE-7, EVE-9, EVE-10, EVE-11, EVE-12, EVE-13, EVE-14, EVE-18, EVE-38, EVE-64, EVE-72, EVE-73, EVE-74, EVE-75, EVE-76

---

## 📝 Notes

- This file is automatically maintained by Claude Code
- All dates in YYYY-MM-DD format
- Links point to Linear workspace issues
- File updated after every work session and status change
- **Critical issues (EVE-97) should be prioritized before new feature development**
- Mobile auth flow (EVE-80, 81, 82) marked "In Progress" but may be functionally complete

---

## 🎯 Recommended Next Steps

### Immediate Priority
1. **EVE-97** - Fix Critical ESI Integration Issues (blocks core backend functionality)
2. **EVE-71** - Resolve GitHub Actions billing lock (blocks CI/CD)
3. **Verify EVE-80/81/82** - Confirm mobile auth is complete or needs work

### Short-term (Next Sprint)
- Complete character management (EVE-85 through EVE-89)
- Implement skills display (EVE-90, EVE-91, EVE-93)
- Build dashboard (EVE-95)

### Medium-term (Next Month)
- Paid tier features (EVE-27, EVE-28, EVE-29, EVE-30)
- Freemium implementation (EVE-42, EVE-43, EVE-46, EVE-47)
- Beta program launch (EVE-50)

---

**Maintained by:** Claude Code (Autonomous Implementer)
**Project:** EVE Online Tool
**Linear Workspace:** https://linear.app/eve-online-tool
