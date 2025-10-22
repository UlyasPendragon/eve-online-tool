# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an EVE Online third-party tool development project in its early planning stage. The project aims to create a commercial application that serves the EVE Online player community while complying with CCP Games' Developer License Agreement and Third-Party Policies.

## Current Project State

The repository contains comprehensive research and planning documentation. A detailed development roadmap with 54 issues across 6 phases has been created in Linear, covering:
- Foundation & Infrastructure setup
- EVE Nomad mobile app development (Primary MVP)
- Backend services and freemium implementation
- Community engagement and public launch strategy

**Status**: ✅ **Active Development** - Phase 1 in progress

### Completed Work
- ✅ **EVE-8**: EVE Partner Program application prepared
- ✅ **EVE-9**: Development environment fully operational
  - Node.js + TypeScript backend with Fastify
  - PostgreSQL 16 + Redis 7 (Docker)
  - Prisma ORM, BullMQ, authentication ready
  - ESI client service with type definitions
  - OAuth 2.0 flow working (authorization complete)
  - All documentation and setup guides created
- ✅ **EVE-10**: ESI OAuth authentication system complete
  - Full OAuth 2.0 authorization code flow implemented
  - Token exchange, verification, and refresh
  - AES-256-GCM token encryption
  - JWT session management with database tracking
  - Multi-character support (add/remove characters)
  - Background token refresh job (BullMQ)
  - Auth middleware for protected routes
  - Complete testing documentation created
- ✅ **EVE-63**: Claude Code subagents implementation complete
  - 6 strategic subagents for quality, security, and domain expertise
  - Comprehensive usage documentation (SUBAGENTS.md)
  - Integration guide with token cost analysis
  - Manual invocation only for controlled costs (~$1.50-2.00/month)
- ✅ **EVE-65**: Prisma client singleton pattern implemented
  - Created shared Prisma client utility
  - Updated all services to use getPrisma()
  - Added graceful shutdown to server
  - Prevents connection pool exhaustion and memory leaks
- ✅ **EVE-66**: Custom domain errors implemented
  - Replaced generic Error classes with domain-specific errors
  - RecordNotFoundError, ReauthRequiredError, AuthorizationError
  - Proper HTTP status codes (404, 401, 403, 500)
  - Better error categorization in Sentry
- ✅ **EVE-67**: Production-grade logging implemented
  - Replaced all console.log with Pino logger
  - Structured logging with context objects
  - Automatic Sentry integration for errors
  - Sensitive data redaction and correlation IDs
- ✅ **EVE-68**: Token encryption error handling added
  - Created config validator with startup validation
  - Wrapped all encryption/decryption calls in try-catch
  - Fail-fast on missing or invalid ENCRYPTION_KEY
  - Graceful error handling for configuration issues
- ✅ **EVE-69**: Race condition fixed in character creation
  - Refactored to use Prisma's atomic upsert operation
  - Eliminated check-then-update pattern
  - Prevents concurrent OAuth flow failures
  - Idempotent character creation/update

### Current Development Location
The backend API is located in `eve-nomad-backend/` directory with full development environment operational.

## Project Management: Linear MCP Integration

This project uses **Linear** for development tracking via the Model Context Protocol (MCP). All development tasks, features, bugs, and project planning should be tracked through Linear.

### Linear Workspace

- **Workspace Name**: EVE Online Tool
- **Purpose**: Centralized project management for all EVE Online third-party tool development
- **Access**: https://linear.app

### Linear MCP Setup

The official Linear MCP server is configured for this project:
- **Server URL**: https://mcp.linear.app/sse
- **Transport**: SSE (Server-Sent Events)
- **Configuration**: `claude mcp add --transport sse linear https://mcp.linear.app/sse`
- **Status**: ✓ Connected

### Using Linear MCP

Linear MCP provides AI-native access to Linear's project management capabilities:
- **Find & Query**: Search for issues, projects, teams, and users
- **Create Issues**: Create new tasks and bugs directly from Claude Code
- **Update Issues**: Modify existing issues, change status, assign, add labels
- **Project Management**: Create and manage projects
- **Comments**: Add comments and context to issues

### Best Practices

- Create Linear issues for all features before implementation
- Track bugs and technical debt in Linear
- Use Linear projects to organize work by product concept (EVE Nomad, Industrialist's Ledger, CEO's Dashboard)
- Reference Linear issue IDs in commit messages and pull requests
- Update issue status as work progresses

### Documentation

- Linear MCP Docs: https://linear.app/docs/mcp
- Linear API: https://developers.linear.app/

## Development Roadmap in Linear

The complete development plan for EVE Online Tool is organized in Linear across **54 issues** spanning **6 development phases**:

### Linear Projects

1. **Foundation & Infrastructure** (20 issues)
   - ESI API integration and OAuth authentication
   - Database schema and backend services
   - Server hosting, monitoring, and backups
   - Subscription billing and payment processing
   - Analytics and customer support systems

2. **EVE Nomad - Mobile Companion App** (21 issues)
   - Primary MVP product - Cross-platform mobile app
   - Free tier: Skill queue monitoring, push notifications, server status, wallet
   - Paid tier ($2-5/month): EVE Mail, market orders, assets, industry/PI
   - iOS and Android app store deployment

3. **The Industrialist's Ledger** (Future)
   - Industrial production and logistics planner
   - Planned as second product expansion

4. **The CEO's Dashboard** (Future)
   - Corporation management SaaS platform
   - Planned as third product expansion

5. **Community & Marketing** (13 issues)
   - Community engagement (Discord, r/Eve, beta program)
   - Marketing content and creator partnerships
   - Website and landing page
   - Public launch execution

### Development Phases

**Phase 1: Foundation & Infrastructure** (14 issues)
- Core technical setup, ESI integration, CCP compliance
- Database, caching, authentication, monitoring
- Legal docs (Terms of Service, Privacy Policy)

**Phase 2: EVE Nomad MVP** (15 issues)
- Mobile framework selection and UI/UX design
- Free and paid tier feature development
- App store submission and approval

**Phase 3: Backend Services** (6 issues)
- Subscription billing (Stripe)
- Email notifications and background jobs
- Analytics, support ticketing, disaster recovery

**Phase 4: Freemium Implementation** (6 issues)
- Feature access control by subscription tier
- iOS/Android in-app purchases
- Subscription management portal
- Conversion optimization

**Phase 5: Community Engagement** (7 issues)
- Beta program, Discord, r/Eve announcement
- Public roadmap and content marketing
- Content creator partnerships, website launch

**Phase 6: Launch & Iteration** (6 issues)
- Public launch execution
- Feedback collection and CI/CD pipeline
- Release cadence and metrics monitoring
- Post-launch feature planning

### Accessing the Roadmap

- **View Issues**: Use Linear MCP to query issues by project or phase
- **Track Progress**: All issues have detailed task breakdowns and acceptance criteria
- **References**: Each issue links back to relevant sections in `Docs/idea research.md`

## Key Concepts & Constraints

### CCP Developer License Agreement Compliance

All development MUST comply with CCP's strict policies:

- **Prohibited**: Charging real-world currency fees for direct access to ESI (EVE Swagger Interface) data or application features
- **Permitted**:
  - Voluntary donations (Patreon, GitHub Sponsors) without restricting access
  - Advertising revenue (e.g., Google AdSense)
  - In-game currency (ISK) fees for access or features
  - Charging for value-added services (server-side processing, historical data storage, complex analytics) rather than raw API data access

### Viable Monetization Model

The "Hybrid Freemium" model (exemplified by EVE Tycoon):
- Free tier provides universal access to core features and ESI data
- Paid tier unlocks advanced features requiring significant backend infrastructure
- Subscription fee justified as payment for backend services (data storage, processing, hosting) not for ESI data itself

## Product Development Opportunities

Three primary concepts identified in research:

### 1. EVE Nomad - Mobile Companion App
- Target: Active players needing mobile access to game management
- Pain point: Current mobile apps are buggy, abandoned, and poorly maintained
- Key features: Skill queue monitoring, EVE Mail, market orders, asset browser, industry/PI dashboard
- Monetization: $2-5/month subscription for premium features

### 2. The Industrialist's Ledger - Production Planner
- Target: Industrial players from solo producers to corp directors
- Pain point: Complex multi-stage production planning requires manual spreadsheets
- Key features: Multi-stage project planning, asset-aware sourcing, build vs. buy analysis, integrated logistics
- Monetization: $5-10/month for advanced workflow automation

### 3. The CEO's Dashboard - Corporation Management SaaS
- Target: Small to medium corp leadership (5-100 members)
- Pain point: Powerful tools (SeAT, Alliance Auth) require technical expertise to self-host
- Key features: Recruitment pipeline, activity monitoring, SRP management, doctrine tracking, Discord integration
- Monetization: Per-seat pricing (~$0.50/member/month)

## Technical Architecture Guidelines

### Backend Technology Stack (Implemented)

**Framework Decision:** Node.js + TypeScript (validated via EVE-9)

**Current Stack:**
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

**Project Structure:**
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

**Development Server:**
- API: http://localhost:3000
- Health Check: http://localhost:3000/health
- API Docs: http://localhost:3000/docs (Swagger UI)
- OAuth Login: http://localhost:3000/auth/login

**Running the Backend:**
```bash
cd eve-nomad-backend
docker-compose up -d          # Start PostgreSQL + Redis
pnpm prisma migrate dev       # Run migrations
pnpm dev                       # Start dev server (hot reload)
```

**Detailed Documentation:**
- Setup Guide: `eve-nomad-backend/SETUP.md`
- Testing Guide: `eve-nomad-backend/TESTING.md` (API testing, OAuth flow, troubleshooting)
- ESI Resources: `eve-nomad-backend/ESI_RESOURCES.md`
- OAuth Setup: `eve-nomad-backend/EVE_SSO_SETUP.md`
- Framework Evaluation: `Docs/Backend_Framework_Evaluation.md`

### API Integration (ESI)
- Built on EVE Swagger Interface (ESI) - the official RESTful API
- Custom ESI client service implemented in `src/services/esi-client.ts`
- TypeScript interfaces for ESI responses in `src/types/esi.ts`
- Respect ESI cache timers and error rate limits
- User-Agent header configured: "EVE Nomad Development (contact@email.com)"
- Rate limit tracking via X-Esi-Error-Limit headers
- All features must work within ESI capabilities and limitations
- ESI documentation: https://esi.evetech.net/

### Backend Requirements
- Significant backend infrastructure required to justify subscription model
- Services that create value beyond raw API calls:
  - Caching ESI data for performance optimization (Redis ready)
  - Storing historical data unavailable from current API endpoints
  - Complex computational analysis (e.g., production chain profitability)
  - User account and authentication management (OAuth working)
  - Push notification systems (Firebase configured)
  - Background job processing (BullMQ ready)

### UX Philosophy
- Polished, modern user experience is a premium marketable feature
- Many existing tools are functionally adequate but have poor UX
- Clean, fast, intuitive interface can justify subscription pricing
- Mobile apps should use cross-platform frameworks (React Native/Flutter)

## Community Engagement Strategy

### Essential Practices
- Announce projects early on r/Eve subreddit and official EVE forums
- Create dedicated Discord for beta testers and early adopters
- Actively solicit and incorporate community feedback
- Maintain public development roadmap (transparency builds trust)
- Apply for EVE Partner Program for legitimacy and visibility

### Marketing Approach
- Demonstrate value through problem-solving content
- Create tutorials, guides, and YouTube videos showing real gameplay use
- Partner with EVE content creators for reviews and exposure
- Focus on solving specific pain points, not generic features

## Claude Code Subagents

This project uses **6 strategic subagents** for specialized, high-value development tasks. All subagents are manually invoked to maintain control over token costs.

### Available Subagents

Located in `.claude/agents/`:

#### Phase 1: Security & Quality Gates
1. **security-auditor** (Opus) - Strict security analysis for auth, payments, sensitive data
2. **code-reviewer** (Sonnet) - Code quality, performance, best practices review

#### Phase 2: Domain Expertise
3. **esi-integration-expert** (Sonnet) - EVE ESI API integration specialist
4. **test-architect** (Sonnet) - Test strategy and generation

#### Phase 3: Optimization Specialists
5. **database-optimizer** (Sonnet) - Prisma schema and query optimization
6. **api-architect** (Sonnet) - REST API design and OpenAPI specs

### When to Use Subagents

**High-ROI Scenarios:**
- Security-critical changes (OAuth, payments, tokens) → **security-auditor**
- Pre-merge code reviews → **code-reviewer**
- New ESI endpoints or ESI issues → **esi-integration-expert**
- Schema design or slow queries → **database-optimizer**
- Test suite creation → **test-architect**
- New API surface design → **api-architect**

**Avoid for:**
- Routine refactoring (use main conversation)
- Simple bug fixes (use main conversation)
- Documentation writing (use main conversation)

### Invocation Examples

```
Use the security-auditor to review src/auth/esi.ts
Use the code-reviewer to review the wallet service
Use the esi-integration-expert to implement the skills endpoint
Use the database-optimizer to review the character schema
Use the test-architect to create tests for character.service.ts
Use the api-architect to design the wallet transaction API
```

### Token Economics

- **Per-invocation cost**: 8,000-25,000 tokens (3-4x multiplier)
- **Monthly estimate**: ~370,000 tokens (~$1.50-2.00/month)
- **ROI**: High (prevents issues costing more to fix later)

### Documentation

- **Comprehensive Guide**: `SUBAGENTS.md` (usage, examples, best practices)
- **Integration Guide**: `Docs/subagent-integration-guide.md` (workflows, token costs)
- **Linear Issue**: EVE-63 (Subagents implementation)

### Best Practices

1. **Explicit invocation**: Always name the subagent explicitly
2. **Scope the task**: Provide clear, bounded scope (specific files/directories)
3. **One at a time**: Don't chain multiple subagents in one request
4. **Read reports carefully**: Implement critical issues immediately
5. **Track costs**: Monitor token usage, use sparingly on large codebases

## Development Philosophy

### Launch Strategy
- Start with Minimum Viable Product (MVP) solving 1-2 core pain points
- Implement freemium model from day one
- Collect real-world feedback before feature expansion
- Avoid feature creep before initial launch

### Sustainability Focus
- Subscription revenue must cover operational costs and developer time
- Prevent burnout that has killed many EVE tools
- Sustainable business = long-term support promise to users
- Community trusts tools with visible, ongoing maintenance

### Competitive Positioning
- Do NOT attempt to replace entrenched free tools (Pyfa, DOTLAN, zKillboard)
- Focus on underserved niches or workflow integration
- Build tools that complement/integrate with existing ecosystem
- Specialize rather than generalize

## Key EVE Ecosystem Tools (Context)

Players heavily rely on these established free tools:
- **zKillboard**: Central PvP combat database, community standard for kill/loss tracking
- **Pyfa**: Offline ship fitting and theorycrafting, gold standard despite in-game alternatives
- **DOTLAN**: Strategic navigation and sovereignty mapping
- **EVE Tycoon**: Successful freemium market/industry profit tracker (monetization template)

## Market Pain Points to Address

High-priority player frustrations identified:
1. Mobile app abandonment and poor quality
2. Complex industrial production chain management ("spreadsheet problem")
3. Tedious Planetary Interaction multi-character management
4. Fragmented workflow requiring dozens of browser tabs
5. Technical barriers to corporation management tools
6. Difficulty finding content for solo/small group players

## EVE Partner Program

### Overview

The EVE Online Partnership Program provides official recognition, promotional support, and development resources for qualified third-party developers.

### Requirements for Third-Party Developers

- **User Base:** Minimum 1,000 monthly active users (verified metrics)
- **Maintenance:** Evidence of regular sustained effort to keep project up-to-date
- **Content Focus:** At least 30% of created content must be EVE Online-related
- **Account Standing:** Account in good standing with CCP

**Note:** Requirements are aspirational - CCP reviews applications individually. Rejected applicants may reapply after 90 days.

### Partner Benefits

1. **Game Time Support:** Free Omega account + 500 PLEX monthly
2. **Developer Access:** Exclusive partner community, CCP developer networking, **early access to new ESI routes** (2-week advance)
3. **Exclusive SKINs:** Monthly Media Miasma SKIN bundles for giveaways
4. **Promotional Support:** Featuring on EVE website, social media, Steam, launcher
5. **Revenue Sharing:** 5% revenue share via WeHype creator codes

### Application Timeline

- **Current Stage:** Pre-MVP (0 monthly users)
- **Target Application:** Month 9-12 after reaching 1,000 MAU
- **Application URL:** https://www.eveonline.com/partners

### Application Materials

A comprehensive application template has been prepared at `Docs/EVE_Partner_Program_Application_Template.md` including:
- Project overview and value proposition
- User metrics and growth trajectory
- Maintenance evidence and update history
- Community presence documentation
- Development roadmap
- CCP compliance documentation references

**Related Linear Issue:** EVE-8 (Apply for EVE Partner Program)

## Next Development Steps

### Current Status
Authentication system (EVE-10) and code quality improvements (EVE-65 through EVE-69) are complete. The backend is now production-ready with:
- ✅ OAuth 2.0 authentication working
- ✅ Prisma singleton pattern preventing connection issues
- ✅ Custom domain errors with proper HTTP status codes
- ✅ Production-grade Pino logging with Sentry integration
- ✅ Token encryption error handling with startup validation
- ✅ Race condition fixed with atomic upsert operations

### Priority: Version Control Setup
Before continuing feature development, establish version control and CI/CD foundation:

**Next Task: EVE-64 - Set up GitHub Repository**
- Create GitHub repository (private initially)
- Configure .gitignore for Node.js/TypeScript
- Set up branch protection rules
- Create PR templates with quality gate checklists
- Enable Linear issue integration for commit tracking
- Document branching strategy (GitHub Flow recommended)

**Why This Is Critical:**
- Blocks CI/CD pipeline setup (EVE-14)
- Required for code review and collaboration
- Enables backup and disaster recovery
- Allows tracking changes and reverting bugs
- Foundation for automated testing and deployment

### Upcoming Phase 1 Tasks (After Version Control)
- **EVE-11**: Refine database schema (basic schema exists in `prisma/schema.prisma`)
- **EVE-12**: Expand ESI client library (base client exists in `src/services/esi-client.ts`)
- **EVE-13**: Implement ESI data caching layer (Redis configured and ready)
- **EVE-14**: Set up continuous integration pipeline (requires EVE-64 first)
- **EVE-19**: Implement user account management system
- **EVE-36**: Build subscription management and billing system

### Backend Development Workflow
```bash
# Start development environment
cd eve-nomad-backend
docker-compose up -d
pnpm dev

# Common commands
pnpm lint                      # Run ESLint
pnpm format                    # Format code with Prettier
pnpm typecheck                 # Check TypeScript types
pnpm prisma studio            # Open database UI
pnpm prisma migrate dev       # Create new migration
```

## References

### Project Documentation
- Research document: `Docs/idea research.md`
- CCP Compliance Documentation: `Docs/CCP_Compliance_Documentation.md`
- Partner Program Application Template: `Docs/EVE_Partner_Program_Application_Template.md`
- Backend Framework Evaluation: `Docs/Backend_Framework_Evaluation.md`

### Backend Documentation
- Backend Setup Guide: `eve-nomad-backend/SETUP.md`
- Backend Testing Guide: `eve-nomad-backend/TESTING.md`
- ESI Resources: `eve-nomad-backend/ESI_RESOURCES.md`
- OAuth Setup: `eve-nomad-backend/EVE_SSO_SETUP.md`

### Claude Code Subagents
- **Subagents Usage Guide**: `SUBAGENTS.md` (comprehensive guide with examples)
- **Integration Guide**: `Docs/subagent-integration-guide.md` (workflows, token costs)
- **Agent Configurations**: `.claude/agents/` (6 subagent definition files)
- **Linear Issue**: EVE-63 (Subagents implementation tracking)

### External Resources
- ESI API: https://esi.evetech.net/
- CCP Developer License: Check developers.eveonline.com for current terms
- EVE Partner Program: https://www.eveonline.com/partners
