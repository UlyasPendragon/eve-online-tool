# EVE Nomad Web Application

**Status:** 🌐 Active Development (Phase 2b)
**Framework:** Next.js 16 (App Router, React 19)
**Styling:** Tailwind CSS 4
**State Management:** Zustand + TanStack Query v5

## Project Overview

EVE Nomad Web is the primary web application for EVE Online players to manage their characters, track skills, monitor wallet, and manage market orders. This is the MVP product for the EVE Nomad tool suite.

### Why Web First?

After analyzing the EVE Online ecosystem, we pivoted from mobile-first to web-first development:
- **Target Audience:** EVE players are desktop users who use tools while actively playing
- **Discoverability:** Web tools appear in Google searches, mobile apps are hidden in app stores
- **Successful Precedent:** All major EVE tools (zKillboard, DOTLAN, EVE Tycoon) are web-based
- **Workflow Integration:** Players use browsers while gaming (wiki, fittings, maps)
- **Development Advantages:** No app store approval, instant deployment, simpler OAuth flow

See [CLAUDE.md](../CLAUDE.md) "Strategic Pivot" section for full rationale.

## Technology Stack

### Core Framework
- **Next.js 16.0.1** - React framework with App Router and Server Components
- **React 19.2.0** - Latest React with improved performance
- **TypeScript 5.9.3** - Strict type safety

### Styling & UI
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **shadcn/ui** - (To be installed) - High-quality component library
- **EVE-themed Design System** - Dark space aesthetic (#0A0E27 background, #1E88E5 primary)

### State & Data Fetching
- **Zustand 5.0.8** - Lightweight state management (auth, active character, settings)
- **TanStack Query 5.90.5** - Server state management with caching
- **Axios 1.13.1** - HTTP client with interceptors for JWT auth

### Development Tools
- **ESLint 9** - Code linting
- **Prettier 3.6.2** - Code formatting
- **TypeScript** - Static type checking

## Quick Start

### Prerequisites

- Node.js v22+ (same version as backend)
- pnpm 10+ (package manager)
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Navigate to project directory
cd eve-nomad-web

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Update .env.local with your EVE SSO Client ID
# (Get from: https://developers.eveonline.com/)
```

### Development Server

```bash
# Start dev server (runs on http://localhost:3001)
pnpm dev

# Open browser
# Navigate to http://localhost:3001
```

### Other Commands

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Code formatting
pnpm format

# Production build
pnpm build

# Production server
pnpm start
```

## Environment Variables

All environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

See [.env.example](./.env.example) for complete documentation.

### Required Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:3000`)
- `NEXT_PUBLIC_EVE_SSO_CLIENT_ID` - EVE SSO OAuth client ID (register at developers.eveonline.com)
- `NEXT_PUBLIC_OAUTH_CALLBACK_URL` - OAuth callback URL (default: `http://localhost:3001/auth/callback`)

## Project Structure

```
eve-nomad-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes (login, register, callback)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   └── features/          # Feature-specific components
│   ├── lib/                   # Utility libraries
│   │   ├── api/               # Axios client and API functions
│   │   ├── stores/            # Zustand stores
│   │   └── utils/             # Utility functions
│   ├── hooks/                 # Custom React hooks
│   │   └── queries/           # TanStack Query hooks
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles
├── public/                    # Static assets
├── .env.local                 # Local environment variables (gitignored)
├── .env.example               # Environment template
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Code Reuse from Mobile

60-70% of business logic from the React Native mobile app can be reused:

- **100% Reusable:**
  - API client structure (Axios configuration)
  - React Query hooks (data fetching patterns)
  - Zustand stores (state management)
  - Type definitions (TypeScript interfaces)
  - JWT utilities (token decoding, validation)

- **Needs Adaptation:**
  - API client imports (remove Expo Router, use Next.js redirect)
  - Storage service (MMKV → localStorage)
  - OAuth flow (deep links → standard redirects)

- **0% Reusable:**
  - UI components (React Native → React + Tailwind)

See [EVE-103](https://linear.app/eve-online-tool/issue/EVE-103) for migration details.

## Development Roadmap

### Completed (EVE-102)
- ✅ Next.js 16 project initialized
- ✅ Dependencies installed (Zustand, React Query, Axios)
- ✅ Environment configuration
- ✅ Development server verified (http://localhost:3001)

### Next Up (Week 1)
- **EVE-103:** Copy and adapt reusable code from mobile
- **EVE-104:** Update backend CORS for web client
- **EVE-105-109:** Complete authentication system

### Full MVP Timeline
See [LINEAR_ISSUES.md](../LINEAR_ISSUES.md) for complete 3-week roadmap (EVE-102 to EVE-121).

## Backend Integration

### API Endpoints Used

- `GET /health` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - Email/password login
- `GET /auth/login?mobile=false` - EVE SSO OAuth (web flow)
- `GET /auth/callback` - OAuth callback handler
- `POST /auth/refresh` - JWT token refresh
- `POST /auth/logout` - Session invalidation
- `GET /characters` - List user's characters
- `GET /characters/:id` - Character details

### Authentication Flow

1. User clicks "Login with EVE Online"
2. Redirect to backend `/auth/login?mobile=false`
3. Backend redirects to EVE SSO authorization
4. User authorizes, EVE SSO redirects to backend `/auth/callback`
5. Backend exchanges code for tokens, creates user/character, generates JWT
6. Backend redirects to web `/auth/callback?token=<jwt>`
7. Web extracts JWT, saves to localStorage, updates Zustand stores
8. Web redirects to dashboard

See [Backend OAuth Setup](../eve-nomad-backend/EVE_SSO_SETUP.md) for detailed flow.

## CCP Compliance

This application complies with CCP Games' Developer License Agreement:

- ✅ **Free Tier:** Full access to ESI data (skills, wallet, market orders, character info)
- ✅ **Paid Tier:** Backend services only (historical storage, advanced notifications, multi-character analytics)
- ✅ **No ESI Paywall:** Never charge for direct ESI data access
- ✅ **Proper Attribution:** EVE Online trademark notices in footer

See [CCP_Compliance_Documentation.md](../Docs/CCP_Compliance_Documentation.md) for details.

## Contributing

This project follows the GitHub feature branch workflow:

1. Create feature branch: `git checkout -b feature/eve-XXX-description`
2. Make changes and commit frequently
3. Reference Linear issue IDs in commits: `git commit -m "EVE-XXX: Description"`
4. Push and create PR: `gh pr create`

See [CONTRIBUTING.md](../CONTRIBUTING.md) and [CLAUDE_CODE_WORKFLOW.md](../CLAUDE_CODE_WORKFLOW.md) for detailed guidelines.

## License

MIT License - See [LICENSE](../LICENSE) for details.

## Resources

- **Linear Project:** [EVE Nomad Web Application](https://linear.app/eve-online-tool/project/eve-nomad-web-application)
- **GitHub Repository:** https://github.com/UlyasPendragon/eve-online-tool
- **Backend Documentation:** [eve-nomad-backend/SETUP.md](../eve-nomad-backend/SETUP.md)
- **ESI Documentation:** https://esi.evetech.net/
- **EVE SSO Registration:** https://developers.eveonline.com/

---

**Generated by:** Claude Code
**Project:** EVE Online Tool
**Status:** Active Development (EVE-102 Complete)
