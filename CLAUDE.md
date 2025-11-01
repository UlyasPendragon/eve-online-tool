# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an EVE Online third-party tool development project creating a commercial application that serves the EVE Online player community while complying with CCP Games' Developer License Agreement and Third-Party Policies.

**Status**: ✅ **Active Development** - Phase 1 (Web MVP) in progress

## Quick Reference

### Current Focus
- **Primary**: Web application development (Next.js 15)
- **Platform**: `eve-nomad-web/` directory
- **Timeline**: Week 1 of 3-week MVP
- **See**: Strategic decision in @Docs/ADR/001-web-first-strategy.md

### Development Locations
- **Backend API**: `eve-nomad-backend/` - Full development environment operational
- **Web App**: `eve-nomad-web/` - Next.js 15 web application (Active)
- **Mobile App**: `eve-nomad-mobile/` - React Native + Expo (Paused, Phase 2)

### Quick Start Commands

**Backend**:
```bash
cd eve-nomad-backend
docker-compose up -d          # Start PostgreSQL + Redis
pnpm prisma migrate dev       # Run migrations
pnpm dev                      # Start dev server
pnpm typecheck && pnpm lint   # Quality checks
```

**Web** (when initialized):
```bash
cd eve-nomad-web
pnpm dev                      # Start Next.js dev server
pnpm typecheck && pnpm lint   # Quality checks
```

**Mobile** (Phase 2):
```bash
cd eve-nomad-mobile
pnpm start                    # Start Expo dev server
```

## Project Status

### Current Development State

**Phase 1: Backend Infrastructure** ✅ Complete
- OAuth 2.0 authentication via EVE SSO
- PostgreSQL database with Prisma ORM
- Redis caching and BullMQ job processing
- Production-grade logging (Pino + Sentry)
- ESI client service with type definitions
- GitHub repository with CI/CD pipeline

**Phase 2: Web MVP** 🔄 In Progress (Week 1/3)
- Strategic pivot to web-first approach (see ADR 001)
- Next.js 15 initialization
- Business logic migration from mobile
- Authentication system implementation
- Dashboard and core features

**Phase 2b: Mobile App** ⏸️ Paused
- Complete authentication system (production-ready)
- UI component library (7 components)
- Navigation infrastructure
- Returning in Phase 2 after web validation

### Known Issues
- ⚠️ **EVE-70**: TypeScript strict mode errors (65+ errors, blocks CI)
- ⚠️ **EVE-71**: GitHub Actions billing lock (account config issue)

See full details in @CHANGELOG.md

## Documentation Structure

This project follows industry-standard documentation practices:

### Core Documentation
- **@CHANGELOG.md** - Complete history of completed work and releases
- **@CONTRIBUTING.md** - GitHub workflow, coding standards, testing requirements
- **@Docs/TECH_STACK.md** - Detailed technical architecture and stack information
- **@Docs/ADR/** - Architecture Decision Records for major decisions

### Additional Documentation
- **@Docs/idea research.md** - Original research and market analysis
- **@Docs/CCP_Compliance_Documentation.md** - CCP policy compliance details
- **@Docs/EVE_Partner_Program_Application_Template.md** - Partner program application
- **@SUBAGENTS.md** - Claude Code subagents usage guide

### Backend Documentation
- `eve-nomad-backend/SETUP.md` - Development environment setup
- `eve-nomad-backend/TESTING.md` - API testing and OAuth flow
- `eve-nomad-backend/ESI_RESOURCES.md` - ESI best practices
- `eve-nomad-backend/EVE_SSO_SETUP.md` - OAuth registration guide

## Project Management

### Linear Integration

This project uses **Linear** for all development tracking via MCP:
- **Workspace**: EVE Online Tool
- **Access**: https://linear.app
- **MCP Server**: https://mcp.linear.app/sse (SSE transport, ✓ Connected)

### Linear Best Practices

1. **Create issues** for all features before implementation
2. **Track progress** with status updates
3. **Reference issue IDs** in commits (`EVE-XX`)
4. **Document completion** with comprehensive comments
5. **Update descriptions** with implementation notes

### Linear Issue Documentation Standard

When completing issues:
1. **Add completion comment** with summary, files changed, decisions, testing, quality checks
2. **Update issue description** with checked items and implementation notes

**Rationale**: Issues serve as permanent documentation of decisions and implementation.

## GitHub Workflow (MANDATORY)

All development MUST follow the feature branch workflow:

```
Linear Issue → Feature Branch → Development → Commit → Push → Pull Request → Review → Merge
```

### Quick Workflow
1. Create feature branch: `git checkout -b feature/eve-XX-description`
2. Commit frequently with issue ID: `EVE-XX: Description`
3. Run quality checks before push
4. Push and create PR
5. Update Linear issue
6. Update CLAUDE.md after merge

**See full details in @CONTRIBUTING.md**

### Branch Naming
- `feature/eve-XX-name` - New features
- `fix/eve-XX-name` - Bug fixes
- `refactor/eve-XX-name` - Code refactoring
- `docs/eve-XX-name` - Documentation updates

### Commit Message Format
```
EVE-XX: Brief description (50 chars max)

Detailed explanation:
- What was changed
- Why it was changed
- How it works

Closes EVE-XX

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Development Roadmap

The project has **54 issues** across **6 development phases** organized in Linear:

### Linear Projects
1. **Foundation & Infrastructure** (20 issues) - Backend, ESI, database, monitoring
2. **EVE Nomad - Web/Mobile App** (21 issues) - MVP product development
3. **The Industrialist's Ledger** (Future) - Production planner
4. **The CEO's Dashboard** (Future) - Corp management SaaS
5. **Community & Marketing** (13 issues) - Discord, r/Eve, beta program, launch

### Development Phases
- **Phase 1**: Foundation & Infrastructure (14 issues) ✅ Complete
- **Phase 2**: Web MVP (22 issues) 🔄 In Progress
- **Phase 2b**: Mobile MVP (15 issues) ⏸️ Paused
- **Phase 3**: Backend Services (6 issues) - Billing, notifications, analytics
- **Phase 4**: Freemium Implementation (6 issues) - Subscription management
- **Phase 5**: Community Engagement (7 issues) - Beta, marketing, partnerships
- **Phase 6**: Launch & Iteration (6 issues) - Public launch, metrics, feedback

## Key Concepts & Constraints

### CCP Developer License Agreement Compliance

**CRITICAL**: All development MUST comply with CCP's strict policies.

**Prohibited**:
- Charging real-world currency for direct ESI data access
- Charging for application features that only display ESI data

**Permitted**:
- Voluntary donations (Patreon, GitHub Sponsors)
- Advertising revenue (Google AdSense)
- In-game currency (ISK) fees
- Charging for **value-added backend services** (storage, processing, analytics)

### Viable Monetization Model

**"Hybrid Freemium"** (exemplified by EVE Tycoon):
- **Free tier**: Universal access to core features and ESI data
- **Paid tier**: Advanced features requiring backend infrastructure
- **Justification**: Payment for backend services (storage, processing, hosting), NOT for ESI data

**Our Model**:
- Free: Full ESI data access (skills, wallet, market, character info)
- Premium ($4.99/month): Backend services (historical data, advanced notifications, multi-character analytics)

### ESI API Integration

- **Official API**: EVE Swagger Interface (ESI) - https://esi.evetech.net/
- **Client**: Custom Axios-based client in `src/services/esi-client.ts`
- **Types**: TypeScript interfaces in `src/types/esi.ts`
- **Rate Limits**: Respect cache timers and X-Esi-Error-Limit headers
- **User-Agent**: "EVE Nomad Development (contact@email.com)"

## Product Development Opportunities

Three primary concepts:

### 1. EVE Nomad - Mobile/Web Companion (Current MVP)
- **Target**: Active players needing game management access
- **Pain point**: Current tools are buggy, abandoned, or desktop-only
- **Features**: Skill queue, wallet, market orders, asset browser, character management
- **Monetization**: $4.99/month for premium backend services

### 2. The Industrialist's Ledger (Future)
- **Target**: Industrial players (solo to corp directors)
- **Pain point**: Complex production planning requires manual spreadsheets
- **Features**: Multi-stage planning, asset sourcing, build vs. buy analysis
- **Monetization**: $5-10/month for workflow automation

### 3. The CEO's Dashboard (Future)
- **Target**: Small to medium corp leadership (5-100 members)
- **Pain point**: Powerful tools (SeAT, Alliance Auth) require self-hosting expertise
- **Features**: Recruitment, activity monitoring, SRP, doctrine tracking
- **Monetization**: Per-seat pricing (~$0.50/member/month)

## Claude Code Subagents

This project uses **6 strategic subagents** for specialized development tasks:

### Available Subagents (Manual Invocation Only)
1. **security-auditor** (Opus) - Auth, payments, sensitive data security
2. **code-reviewer** (Sonnet) - Code quality, performance, best practices
3. **esi-integration-expert** (Sonnet) - EVE ESI API integration
4. **test-architect** (Sonnet) - Test strategy and generation
5. **database-optimizer** (Sonnet) - Prisma schema and query optimization
6. **api-architect** (Sonnet) - REST API design and OpenAPI specs

### When to Use
- Security-critical changes → **security-auditor**
- Pre-merge reviews → **code-reviewer**
- ESI endpoint implementation → **esi-integration-expert**
- Schema design or slow queries → **database-optimizer**
- Test suite creation → **test-architect**
- API design → **api-architect**

**Token Cost**: ~8,000-25,000 tokens per invocation (~$1.50-2.00/month estimated)

**See full details in @SUBAGENTS.md**

## Community Engagement Strategy

### Essential Practices
- Announce early on r/Eve subreddit and EVE forums
- Create Discord for beta testers and early adopters
- Solicit and incorporate community feedback actively
- Maintain public development roadmap (transparency)
- Apply for EVE Partner Program (post-1,000 MAU)

### Marketing Approach
- Demonstrate value through problem-solving content
- Create tutorials, guides, YouTube videos
- Partner with EVE content creators
- Focus on specific pain points, not generic features

## EVE Partner Program

**Application Timeline**: Month 9-12 after reaching 1,000 MAU
**Requirements**: 1,000+ monthly active users, regular maintenance, EVE-focused content
**Benefits**: Free Omega, 500 PLEX/month, early ESI access, promotional support

**See application template in @Docs/EVE_Partner_Program_Application_Template.md**

## Development Philosophy

### Launch Strategy
- Start with MVP solving 1-2 core pain points
- Implement freemium from day one
- Collect feedback before feature expansion
- Avoid feature creep before initial launch

### Sustainability Focus
- Subscription revenue must cover operational costs + developer time
- Prevent burnout that has killed many EVE tools
- Sustainable business = long-term support promise
- Community trusts tools with visible maintenance

### Competitive Positioning
- Do NOT replace entrenched free tools (Pyfa, DOTLAN, zKillboard)
- Focus on underserved niches or workflow integration
- Complement existing ecosystem
- Specialize rather than generalize

## Key EVE Ecosystem Tools (Context)

Major established tools (all web-based):
- **zKillboard** - PvP combat database (community standard)
- **Pyfa** - Ship fitting and theorycrafting (gold standard)
- **DOTLAN** - Navigation and sovereignty mapping
- **EVE Tycoon** - Freemium market/industry tracker (our monetization model)

## Market Pain Points

High-priority player frustrations:
1. Mobile app abandonment and poor quality ← **Our focus**
2. Complex industrial production planning ("spreadsheet problem")
3. Tedious Planetary Interaction multi-character management
4. Fragmented workflow requiring dozens of browser tabs
5. Technical barriers to corporation management tools
6. Difficulty finding content for solo/small groups

## Next Development Steps

### Immediate Priorities

**Web App (Primary Focus)**:
1. **EVE-102**: Next.js 15 initialization
2. **EVE-103**: Business logic migration from mobile
3. **EVE-105-109**: Authentication system (OAuth, JWT, session management)
4. **EVE-114-118**: Dashboard implementation (character overview, skills, wallet)
5. **EVE-119-121**: Production deployment (Vercel, monitoring, analytics)

**Backend (As Needed)**:
1. **EVE-19**: Complete user account management (email/password auth)
2. **EVE-70**: Fix TypeScript strict mode errors (65+ errors)
3. **EVE-71**: Resolve GitHub Actions billing lock

## External Resources

- **ESI API**: https://esi.evetech.net/
- **CCP Developer License**: https://developers.eveonline.com/
- **EVE Partner Program**: https://www.eveonline.com/partners
- **Linear Workspace**: https://linear.app/eve-online-tool
- **GitHub Repository**: https://github.com/UlyasPendragon/eve-online-tool

---

**Note**: This CLAUDE.md now follows industry standards by importing detailed documentation via @file syntax. All context is preserved in specialized files (CHANGELOG.md, CONTRIBUTING.md, TECH_STACK.md, ADR documents).
