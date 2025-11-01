# ADR 001: Web-First Development Strategy

## Status
**Accepted** - Decision Date: 2025-10-30

## Context

The project was initially planned as a mobile-first application (EVE Nomad Mobile App) with significant mobile development completed:
- Complete React Native + Expo authentication system
- Navigation infrastructure with 5-tab layout
- UI component library with 7 EVE-themed components
- State management and API client integration

After analyzing the EVE Online player ecosystem and successful third-party tools, we identified a strategic misalignment between mobile-first approach and actual player behavior and tool discovery patterns.

## Decision

**We will pivot to a web-first development strategy**, with mobile becoming a companion app in Phase 2 after web MVP validation.

## Decision Makers
- Project Lead (based on EVE Online ecosystem analysis and community research)

## Rationale

### 1. Target Audience = Desktop Players
- EVE Online is a desktop game - players are already at their computers
- Players use tools while actively playing (second monitor setup)
- Mobile is "nice to have," web tools are "essential" to gameplay

### 2. Discoverability & Community
- EVE players discover tools via Google searches and r/Eve subreddit
- Web tools appear in search results (SEO advantage)
- Mobile apps are hidden in app stores, require download before trial
- Community sharing: web links = instant access, mobile = friction

### 3. Successful EVE Tool Precedent
All major successful EVE tools are web-based:
- **zKillboard** (web) - community standard for killboard tracking
- **DOTLAN** (web) - essential navigation and sovereignty tool
- **EVE Tycoon** (web freemium) - profitable market tracking tool
- Mobile apps exist but are supplementary, not primary

### 4. Workflow Integration
- Players have browsers open while gaming (wiki, fittings, maps)
- Copy-paste integration (fit codes, character names, system names)
- Future browser extension possibilities
- Desktop notifications work on web (Push API)

### 5. Development Advantages
- No Apple Developer Program requirement ($99/year)
- No app store approval process (instant deployment)
- Easier OAuth flow (standard redirects vs. deep links)
- Better code reuse (60-70% of mobile business logic transfers)
- Simpler testing (no device builds, simulators, or EAS complexity)

## Consequences

### Positive
- Faster time to market (3-week MVP vs 6-week mobile MVP)
- Immediate community feedback without app store barriers
- Better alignment with EVE player discovery patterns
- Lower operational costs (no app store fees)
- Easier deployment and iteration (Vercel vs EAS)
- 60-70% code reuse from mobile work (API client, hooks, stores)

### Negative
- Mobile work paused temporarily (Phase 2 after web validation)
- Need to learn Next.js 15 and web-specific patterns
- Initial mobile development time appears "wasted" (though code is reused)

### Neutral
- All mobile code preserved in `eve-nomad-mobile/` for Phase 2
- Feature branch `feature/eve-85-mobile-auth-improvements` contains production-ready mobile auth
- Business logic (API client, React Query, Zustand) transfers directly to web

## Implementation Strategy

### Phase 1: Web MVP (Current - 3 weeks)
- Build Next.js 15 web application
- Reuse business logic from mobile (API client, React Query, Zustand)
- Create web-optimized UI with shadcn/ui
- Deploy to Vercel
- Validate with EVE community (r/Eve, forums)

### Phase 2: Mobile Companion (Future - After Web Validation)
- Return to React Native mobile development
- Mobile becomes "companion app" to web tool
- Share backend API and business logic
- Focus on mobile-specific features (skill notifications on-the-go)

## Code Preservation
All completed mobile work is preserved and reusable:
- `eve-nomad-mobile/` directory retained for Phase 2
- Authentication system (OAuth, JWT, token refresh, logout)
- UI component library (7 components)
- Navigation infrastructure (Expo Router)
- State management (Zustand stores)
- API client (Axios with interceptors)

**Estimated code reuse:** 60-70% of mobile business logic transfers to web

## References
- Original Research: `Docs/idea research.md`
- Mobile Development Plan: `Docs/Frontend_Development_Plan.md`
- Linear Epic: EVE-100 (Web Application Development)
- Linear Project: [EVE Nomad Web](https://linear.app/eve-online-tool/project/)

## Notes
This decision demonstrates the importance of validating assumptions with ecosystem research before committing to a platform. The mobile work was not wasted - it validated authentication patterns, state management approaches, and API integration that now benefit the web version.
