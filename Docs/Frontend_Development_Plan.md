# EVE Nomad Mobile Frontend - Development Plan

**Document Version**: 1.0
**Created**: 2025-10-22
**Status**: Approved - Ready for Implementation
**Compliance**: ✅ CCP Developer License Agreement Compliant

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [CCP Compliance Framework](#2-ccp-compliance-framework)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Feature Specification](#5-feature-specification)
6. [Freemium Model (CCP-Compliant)](#6-freemium-model-ccp-compliant)
7. [UI/UX Design](#7-uiux-design)
8. [Technical Architecture](#8-technical-architecture)
9. [Development Phases](#9-development-phases)
10. [Deployment Strategy](#10-deployment-strategy)
11. [Compliance & Legal](#11-compliance--legal)
12. [Risk Mitigation](#12-risk-mitigation)

---

## 1. Executive Summary

EVE Nomad is a **cross-platform mobile companion app** (iOS + Android) designed to solve the critical pain point of mobile access to EVE Online character management. The app fills the market gap left by abandoned/buggy applications like Neocom II.

**Core Value Proposition**: Professional, stable, well-maintained mobile app with a generous free tier and premium backend services justifiable under CCP's Developer License Agreement.

**Technology**: React Native + Expo + TypeScript
**Timeline**: 10-12 weeks to MVP
**Monetization**: Freemium ($0 free tier, $4.99/month premium)

---

## 2. CCP Compliance Framework

### 2.1 Core Principle

**We DO NOT charge for ESI data access. We charge for backend services.**

This distinction is critical for CCP compliance. The subscription fee is for:
- Backend database storage
- Server-side processing and analytics
- 24/7 monitoring infrastructure
- Push notification delivery systems
- Multi-character data aggregation

### 2.2 The "Service vs. Data" Rule

**❌ PROHIBITED**:
- Charging to view skill queue data
- Charging to display wallet balance
- Paywalling ESI data display
- Restricting access to market order information

**✅ PERMITTED**:
- Charging for historical data storage (beyond ESI retention)
- Charging for server-side calculations and analytics
- Charging for push notification infrastructure
- Charging for 24/7 monitoring systems

**Precedent**: EVE Tycoon successfully operates on this model with CCP's apparent acceptance.

### 2.3 Compliance Documentation

Full compliance details: `Docs/CCP_Compliance_Documentation.md`

---

## 3. Technology Stack

### 3.1 Primary Framework

**React Native + Expo (Managed Workflow)**

**Rationale**:
- **TypeScript consistency** with backend (code sharing, type reuse)
- **Cross-platform** - 90%+ code reuse for iOS + Android
- **Expo benefits**:
  - Over-the-air (OTA) updates for instant bug fixes
  - Built-in push notifications (critical for skill alerts)
  - Simplified build/deployment process
  - Managed app distribution

**Alternative Considered**: Flutter (Dart) - Rejected due to language barrier and team expertise

### 3.2 Core Dependencies

```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.x",
  "typescript": "~5.6.2",
  "@react-navigation/native": "^6.1.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.5.0",
  "react-native-mmkv": "^2.12.0",
  "expo-notifications": "~0.28.0",
  "expo-secure-store": "~13.0.0",
  "axios": "^1.6.0"
}
```

### 3.3 Development Tools

- **ESLint** + **Prettier**: Code quality
- **TypeScript strict mode**: Type safety
- **Expo EAS Build**: Cloud builds for iOS/Android
- **Expo EAS Submit**: App store deployment

---

## 4. Project Structure

```
eve-nomad-mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── oauth-callback.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx         # Home screen
│   │   ├── skills.tsx            # Skill queue
│   │   ├── wallet.tsx            # Wallet & transactions
│   │   ├── market.tsx            # Market orders
│   │   └── characters.tsx        # Character switcher
│   ├── character/[id].tsx
│   ├── subscription.tsx          # Premium upgrade
│   ├── _layout.tsx
│   └── +not-found.tsx
├── src/
│   ├── components/
│   │   ├── common/               # Buttons, cards, inputs
│   │   ├── skills/               # Skill queue widgets
│   │   ├── wallet/               # Transaction lists
│   │   ├── market/               # Order tables
│   │   └── subscription/         # Paywall components
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts         # Axios wrapper
│   │   │   ├── auth.ts
│   │   │   ├── characters.ts
│   │   │   ├── skills.ts
│   │   │   ├── wallet.ts
│   │   │   └── market.ts
│   │   ├── notifications.ts
│   │   └── storage.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSubscription.ts    # Premium feature gating
│   │   ├── useCharacters.ts
│   │   ├── useSkillQueue.ts
│   │   └── useWallet.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── characterStore.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── character.ts
│   │   ├── skills.ts
│   │   └── subscription.ts
│   └── utils/
│       ├── formatters.ts         # ISK, dates, numbers
│       ├── theme.ts
│       └── compliance.ts         # Feature gating helpers
├── assets/
├── app.json
├── eas.json                      # EAS Build configuration
├── tsconfig.json
└── package.json
```

---

## 5. Feature Specification

### 5.1 Free Tier Features (Full ESI Data Access)

#### Character Management
- View all authenticated characters
- Switch between characters
- Character portraits, names, corporation/alliance
- Security status, current location

#### Skill Queue Monitoring
- Currently training skill with real-time progress bar
- Full 50-skill queue display
- Skill levels (I-V) and time remaining per skill
- **Basic push notification** for skill completion

#### Wallet Display
- Current ISK balance (all characters)
- Recent transaction history (last 30 days from ESI)
- Transaction details: type, amount, date, location, counterparty
- Filter by transaction type (income/expense)

#### Market Orders
- Active buy/sell orders list
- Order details: item, quantity, price, location, status
- Total ISK locked in active orders
- Order status indicators (active/fulfilled/expired)

#### Server Status
- EVE server online/offline indicator
- Current player count

### 5.2 Premium Tier Features ($4.99/month) - Backend Services

#### Advanced Push Notifications (BACKEND SERVICE)
**Infrastructure**: BullMQ background workers, Redis, Expo Push Notification Service

- Multiple alert types:
  - Market order undercut detection (requires 24/7 monitoring)
  - Wallet threshold alerts (e.g., "Notify when balance > 1B ISK")
  - Industry job completion
  - PI extraction cycle completion
- Configurable alert timing (15min, 1hr, 6hr before event)
- Alert history and delivery tracking
- Push notification badge counts

**Compliance Justification**: Requires continuous backend monitoring infrastructure, database storage for alert configuration, and push notification delivery service.

#### Historical Data Storage (BACKEND SERVICE)
**Infrastructure**: PostgreSQL database storage beyond ESI retention

- Extended wallet history (>30 days - ESI only provides recent)
- Market order history archive (fulfilled/expired orders)
- Transaction analytics and profit/loss over time
- Balance trend charts (7-day, 30-day, 365-day)
- Historical skill queue tracking

**Compliance Justification**: ESI does not retain historical data indefinitely. We store it in our backend database at ongoing storage cost.

#### Multi-Character Aggregation (BACKEND SERVICE)
**Infrastructure**: Server-side computation and database queries

- Combined wallet balance across all characters (total net worth)
- Aggregate transaction summaries (all-character income/expense)
- Cross-character market order totals
- Portfolio analytics and profit tracking

**Compliance Justification**: Requires backend processing to fetch data from multiple ESI endpoints, perform calculations, and aggregate results.

#### Advanced Asset Browser (BACKEND SERVICE)
**Infrastructure**: PostgreSQL indexing, search algorithms

- Full asset indexing across all locations
- Fast search/filter functionality
- Market value calculations (requires price lookups + computation)
- Asset location mapping and visualization
- Total asset value across all characters

**Compliance Justification**: ESI asset endpoint returns raw data. We index it in our database with optimized search algorithms for instant querying.

#### EVE Mail Archive (BACKEND SERVICE)
**Infrastructure**: Database storage, full-text search

- Mail storage beyond ESI retention limits
- Full-text search across mail history
- Threaded conversation view
- Attachment previews
- Compose new mail (copy-to-clipboard for EVE Portal)

**Compliance Justification**: We provide long-term mail archival and search infrastructure that ESI does not offer.

#### Priority API Refresh (BACKEND SERVICE)
**Infrastructure**: Increased API call frequency, enhanced caching

- Free tier: 15-minute cache (respects ESI cache timers)
- Premium tier: 5-minute refresh for near-real-time monitoring

**Compliance Justification**: More frequent API calls create higher infrastructure load and caching complexity.

#### Premium Support
- Priority customer service via Discord/email
- Direct developer contact for feature requests

**Compliance Justification**: Human labor cost.

---

## 6. Freemium Model (CCP-Compliant)

### 6.1 Subscription Messaging (Transparency Required)

**In-App Subscription Screen**:

```
EVE Nomad Premium - $4.99/month

You're NOT paying for ESI data access (that's always free).

You're paying for backend services:

🔔 24/7 Monitoring Infrastructure
   - Real-time order undercut detection
   - Wallet threshold monitoring
   - Industry job completion tracking

📊 Historical Data Storage
   - Extended wallet history beyond ESI limits
   - Market order archives
   - Long-term analytics and charts

⚡ Server-Side Processing
   - Multi-character data aggregation
   - Fast asset search indexing
   - Profit/loss calculations

💾 Secure Cloud Storage
   - EVE Mail archival beyond ESI retention
   - Full-text search across mail history
   - Cross-character portfolio tracking

Your subscription supports:
- Server hosting ($100-500/month)
- Database storage ($50-200/month)
- Push notifications ($10-100/month)
- Ongoing development and support

All ESI data remains free in the basic tier.
```

### 6.2 Feature Comparison Table

| Feature | Free Tier | Premium Tier |
|---------|-----------|--------------|
| Characters | Unlimited | Unlimited |
| Skill Queue Display | ✅ Full access | ✅ Full access |
| Basic Skill Notifications | ✅ Completion alerts | ✅ Enhanced alerts |
| Wallet Balance | ✅ Current balance | ✅ + Historical charts |
| Wallet History | ✅ Last 30 days (ESI) | ✅ Unlimited history |
| Market Orders | ✅ Active orders | ✅ + Historical archive |
| Order Undercut Alerts | ❌ | ✅ Real-time monitoring |
| Multi-Character Analytics | ❌ | ✅ Aggregated totals |
| Asset Browser | ✅ Basic list | ✅ Advanced search/filters |
| EVE Mail | ✅ Read recent | ✅ Full archive + search |
| Data Refresh | 15 minutes | 5 minutes |
| Support | Community Discord | Priority support |

### 6.3 Alternative Monetization (ISK Subscription)

**Fully CCP-Compliant Option**:

- Premium: **500M ISK/month** (paid to developer's EVE character)
- Developer converts ISK → PLEX → subscription time (or sells PLEX)

**Implementation**: Offer both payment options (real $ OR ISK)

---

## 7. UI/UX Design

### 7.1 Design Philosophy

- **Space-themed dark UI** - EVE aesthetic with deep space backgrounds
- **Data density** - Information-rich screens (EVE players expect detail)
- **Performance first** - Instant navigation, 60fps animations
- **Offline-capable** - Cache data, show stale data with refresh indicator

### 7.2 Color Palette (EVE-Inspired)

```
Primary: #1E88E5 (EVE Blue)
Background: #0A0E27 (Deep Space)
Surface: #1A1F3A (Card Backgrounds)
Success: #4CAF50 (Green - profits, buy orders)
Error: #F44336 (Red - losses, sell orders)
Warning: #FFA726 (Orange - alerts)
Text Primary: #FFFFFF
Text Secondary: #B0BEC5
Accent: #00E5FF (Cyan highlights)
```

### 7.3 Typography

- **Headings**: Inter Bold / SF Pro Display
- **Body**: Inter Regular / SF Pro Text
- **Monospace** (ISK values): JetBrains Mono / SF Mono

### 7.4 Key Screens

#### Dashboard (Home)
- Large character portrait
- Currently training skill with progress
- Wallet balance (large, prominent)
- Quick stats: Active orders count, total net worth (premium)
- Quick actions: Refresh, switch character, settings

#### Skill Queue
- Active skill card with circular progress indicator
- Real-time countdown timer
- Full queue list (scrollable)
- Skill icons and level indicators (I-V)
- Push notification settings button

#### Wallet
- Current balance (large header)
- 7-day balance trend chart (premium)
- Transaction history (infinite scroll)
- Filter dropdown (all/income/expense)
- Export button (premium)

#### Market Orders
- Active orders count badge
- Buy/sell order tabs
- Order cards with status badges
- Sort by: date, price, location
- Undercut notification toggle (premium)

---

## 8. Technical Architecture

### 8.1 API Proxy Pattern (Compliance-Critical)

**Mobile app NEVER calls ESI directly**:

```
Mobile App → Backend API → ESI
            ↓
       Backend Services:
       - Token management
       - Data caching (respects ESI timers)
       - Historical storage (premium)
       - Push notifications (premium)
       - Analytics (premium)
```

**Why**: This architecture demonstrates users interact with YOUR service, not raw ESI data.

### 8.2 State Management

**Three-layer architecture**:

1. **Server State** (React Query/TanStack Query)
   - ESI-derived data (skills, wallet, market)
   - Automatic caching, refetching, background updates
   - Optimistic UI updates

2. **Client State** (Zustand)
   - Authentication tokens
   - Active character selection
   - UI preferences
   - Subscription tier

3. **Persistent Storage** (MMKV + Secure Store)
   - Secure Store: JWT tokens, sensitive data
   - MMKV: Character data, cached API responses

### 8.3 Premium Feature Gating

```typescript
// src/hooks/useSubscription.ts
export function useSubscription() {
  const { user } = useAuth();

  return {
    isPremium: user?.subscriptionTier === 'premium',

    // Premium backend services
    canAccessHistoricalData: user?.subscriptionTier === 'premium',
    canAccessAdvancedNotifications: user?.subscriptionTier === 'premium',
    canAccessMultiCharAnalytics: user?.subscriptionTier === 'premium',
    canAccessAssetSearch: user?.subscriptionTier === 'premium',
    canAccessMailArchive: user?.subscriptionTier === 'premium',

    // ESI data always accessible
    canViewSkillQueue: true,
    canViewWallet: true,
    canViewMarketOrders: true,
    canViewCharacterInfo: true,
  };
}

// Usage in components
const { isPremium, canAccessHistoricalData } = useSubscription();

{canAccessHistoricalData ? (
  <WalletHistoryChart days={365} />
) : (
  <UpgradePrompt
    feature="extended historical data storage"
    description="View wallet balance trends over 365 days"
  />
)}
```

### 8.4 Push Notification Flow

```
1. User enables notifications on first launch
2. App registers device token with Expo Push Service
3. Device token sent to backend, stored in Session table
4. Backend BullMQ job checks skill queue every 15 minutes
5. When skill near completion → send push via Expo
6. User taps notification → app opens to Skills screen
```

---

## 9. Development Phases

### Phase 1: Project Setup (Week 1-2)
- Initialize Expo project with TypeScript
- Configure ESLint, Prettier, strict mode
- Set up environment variables (.env)
- Implement navigation structure (Expo Router)
- Create design system (colors, typography, spacing components)
- Set up Axios API client with interceptors

**Deliverable**: Boilerplate app with navigation and design system

### Phase 2: Authentication (Week 2-3)
- OAuth 2.0 flow with deep linking (EVE SSO)
- Email/password login (if EVE-19 complete)
- Token storage (expo-secure-store)
- Auto-refresh token mechanism
- Login/register screens
- Protected route guards

**Deliverable**: Working authentication flow

### Phase 3: Character Management (Week 3-4)
- Character list screen with ESI portraits
- Character switcher component
- Fetch character data from backend
- Character detail view (corp, alliance, location)
- Multi-character state management (Zustand)

**Deliverable**: Character selection and management

### Phase 4: Skill Queue - FREE TIER (Week 4-6) ⭐ PRIORITY
- Skill queue data fetching (backend → ESI)
- Active skill progress bar with real-time countdown
- Full queue list view (50 skills)
- Basic push notification registration
- Local notification testing on device
- Backend BullMQ job for skill completion checks (backend work)

**Deliverable**: Functional skill queue monitoring with basic notifications

### Phase 5: Wallet - FREE + PREMIUM (Week 6-7)
- **Free**: Wallet balance display, recent transactions (30 days)
- **Premium**: Historical data (backend API endpoint needed)
- Transaction history list with infinite scroll
- Filter by transaction type
- Balance trend chart (react-native-chart-kit) - premium only
- Pagination implementation

**Deliverable**: Wallet display with free/premium features

### Phase 6: Market Orders - FREE + PREMIUM (Week 7-8)
- **Free**: Active orders list (buy/sell) from ESI
- **Premium**: Undercut monitoring (backend job needed)
- Order detail view
- Order status indicators
- Total value calculations
- Pull-to-refresh

**Deliverable**: Market order tracking

### Phase 7: Premium Backend Services (Week 8-9)
- Historical data storage API endpoints (backend)
- Advanced notification system implementation
- Multi-character aggregation endpoints (backend)
- Asset indexing service (backend)
- Premium feature gating in UI
- Subscription screen with CCP-compliant messaging

**Deliverable**: Premium tier fully functional

### Phase 8: Polish & Compliance (Week 9-10)
- Dashboard home screen with widgets
- Loading states and skeleton screens
- Error handling and retry logic
- Offline capability testing
- Performance optimization (React.memo, useMemo)
- Terms of Service screen (CCP disclaimers)
- Privacy Policy screen
- Compliance FAQ in settings

**Deliverable**: Polished, compliant app ready for beta

### Phase 9: Testing & App Store Prep (Week 10-11)
- End-to-end testing on iOS/Android devices
- Push notification testing on physical devices
- Build configuration for EAS
- App icons and splash screens (all required sizes)
- Privacy policy integration
- App store listings preparation (screenshots, descriptions)

**Deliverable**: Production-ready builds

### Phase 10: Launch (Week 11-12)
- TestFlight beta (iOS) deployment
- Google Play internal testing track
- Beta tester feedback collection
- Bug fixes and iteration
- App Store submission (iOS)
- Google Play submission (Android)

**Deliverable**: Live apps in app stores

---

## 10. Deployment Strategy

### 10.1 iOS Deployment
1. **TestFlight Beta** (2-3 weeks of testing)
2. **App Store Review** (1-3 days typical)
3. **Requirements**:
   - Apple Developer account ($99/year)
   - Privacy policy URL
   - App Store screenshots (6.5", 5.5" displays)
   - App description (CCP-compliant language)

### 10.2 Android Deployment
1. **Internal Testing** (1-2 weeks)
2. **Open Beta** (optional, 1-2 weeks)
3. **Production Release** (phased rollout: 5% → 25% → 100%)
4. **Requirements**:
   - Google Play Console account ($25 one-time)
   - Privacy policy URL
   - Feature graphic, screenshots
   - Content rating questionnaire

### 10.3 Over-the-Air (OTA) Updates
- Use Expo Updates for instant bug fixes
- Deploy critical fixes without app store approval
- Version tracking and rollback capability
- Update channels (production, staging, beta)

---

## 11. Compliance & Legal

### 11.1 Terms of Service (Required)

**Must include**:

```
## Third-Party Application Notice

EVE Nomad is a third-party application and is not affiliated
with or endorsed by CCP Games.

EVE Online, the EVE logo, EVE and all associated logos and
designs are the intellectual property of CCP hf. All rights
are reserved worldwide.

CCP hf. is in no way responsible for the content on or
functioning of this application, nor can it be liable for any
damage arising from the use of this application.

## Subscription Terms

Premium subscription fees are charged for backend services:
- Historical data storage beyond ESI retention
- 24/7 monitoring and notification infrastructure
- Server-side data processing and analytics
- Multi-character data aggregation services

All EVE Swagger Interface (ESI) data remains freely
accessible in the free tier. You are not paying for access
to ESI data.

[Refund policy, cancellation terms, etc.]
```

### 11.2 Privacy Policy (GDPR Compliant)

**Must address**:
- What ESI data is collected
- How data is stored and used
- Data retention policies
- User data rights (access, deletion requests)
- Third-party services (payment processors, analytics)
- CCP's access to ESI data (it's their data)

### 11.3 In-App Disclaimers

**Settings screen footer**:
```
EVE Online © CCP Games
This app is not affiliated with or endorsed by CCP Games.

By using this app, you agree to our Terms of Service and
Privacy Policy.
```

---

## 12. Risk Mitigation

### 12.1 Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| CCP determines model non-compliant | Low | Critical | Follow EVE Tycoon precedent; document costs; seek CCP clarification if uncertain |
| Community backlash over pricing | Medium | High | Transparent communication; generous free tier; clear cost justification |
| Feature creep into paid tier | Medium | Medium | Compliance checklist for every feature; when in doubt, make it free |
| App store rejection | Low | High | Detailed justification for reviewers; comply with platform policies |
| ESI API downtime | High | Medium | Cached data; clear error messages; retry logic |
| Push notification unreliability | Medium | Medium | Fallback to in-app polling; status indicators |

### 12.2 Mitigation Strategies

**CCP Compliance**:
- Maintain compliance documentation
- Monitor community sentiment on r/Eve
- Be prepared to adjust model if CCP provides guidance
- Keep communication with CCP developer support open

**Community Trust**:
- Transparent development roadmap
- Active presence on Discord, r/Eve
- Responsive to feedback
- Clear communication about costs and value

**Technical Reliability**:
- Comprehensive error handling
- Offline capability
- Performance monitoring (Sentry)
- Regular updates and maintenance

---

## Conclusion

This development plan provides a comprehensive roadmap for building EVE Nomad as a **CCP-compliant, professionally-executed mobile companion app**.

**Key Success Factors**:
1. ✅ Strict CCP compliance (free ESI data, charge for services)
2. ✅ Transparent pricing and cost justification
3. ✅ Professional UX and stability (market differentiator)
4. ✅ Sustainable business model (covers infrastructure + development)
5. ✅ Community trust through transparency

**Timeline**: 10-12 weeks to production-ready MVP
**Next Steps**: Initialize Expo project, create Linear issues for each phase

---

**Document Maintenance**:
This plan is a living document and will be updated as development progresses, requirements change, or CCP guidance evolves.

**Last Updated**: 2025-10-22
**Next Review**: After Phase 4 completion (skill queue implementation)
