# EVE Online Partner Program Application - EVE Nomad

**Application Date:** [TO BE COMPLETED when applying]
**Applicant:** EVE Online Tool Development Team
**Project Name:** EVE Nomad - Mobile Companion App
**Category:** Third-Party Developer (Mobile Application)

---

## Project Overview

### What is EVE Nomad?

EVE Nomad is a modern, cross-platform mobile companion app for EVE Online designed to solve the critical problem of mobile app abandonment in the EVE ecosystem. Current mobile apps (Neocom II, Evanova, EVE Portal) suffer from poor maintenance, buggy performance, and outdated UX - leaving thousands of active EVE players without reliable mobile access to essential game management features.

**EVE Nomad provides:**
- Real-time skill queue monitoring across multiple characters
- Push notifications for skill completion and important events
- Full EVE Mail client with advanced search and organization
- Market order management with undercut alerts
- Advanced asset browser with multi-character aggregation
- Industry and Planetary Interaction dashboard
- Modern, polished user experience that respects players' time

### Problem We Solve

**Market Gap Identified:**
- Existing mobile apps are abandoned or poorly maintained
- Players frustrated with buggy, laggy, outdated interfaces
- No modern mobile app meeting current UX standards
- Mobile access is critical for active players managing multiple characters

**Our Solution:**
- Professional, modern UX design (following iOS/Android design guidelines)
- Reliable, well-maintained application with regular updates
- Freemium model ensuring sustainable long-term development
- CCP-compliant monetization (backend services, not ESI data)

### Technology Stack

- **Platform:** Cross-platform (iOS + Android)
- **Framework:** [React Native / Flutter - TBD]
- **Backend:** [Node.js/Python/Go - TBD]
- **Database:** PostgreSQL + Redis caching
- **API:** EVE Swagger Interface (ESI)
- **Authentication:** EVE SSO OAuth 2.0
- **Notifications:** Firebase Cloud Messaging

---

## User Metrics

**[TO BE COMPLETED at application time - requires 1,000 MAU minimum]**

### Current Status (as of [DATE])

- **Monthly Active Users (MAU):** [TARGET: 1,000+]
- **Daily Active Users (DAU):** [NUMBER]
- **Total Downloads:** [NUMBER]
  - iOS: [NUMBER]
  - Android: [NUMBER]
- **DAU/MAU Ratio (Stickiness):** [PERCENTAGE]%
- **User Retention:**
  - Day 1: [PERCENTAGE]%
  - Day 7: [PERCENTAGE]%
  - Day 30: [TARGET: >40%]%
- **Average Session Duration:** [TIME]
- **App Store Ratings:**
  - iOS App Store: [RATING]/5 ([NUMBER] reviews)
  - Google Play Store: [RATING]/5 ([NUMBER] reviews)

### User Growth Trajectory

- **Month 1:** [NUMBER] MAU
- **Month 2:** [NUMBER] MAU (+[PERCENTAGE]% growth)
- **Month 3:** [NUMBER] MAU (+[PERCENTAGE]% growth)
- **Current Month:** [NUMBER] MAU (+[PERCENTAGE]% growth)

**Growth Rate:** [PERCENTAGE]% month-over-month average

### Geographic Distribution

- North America: [PERCENTAGE]%
- Europe: [PERCENTAGE]%
- Asia-Pacific: [PERCENTAGE]%
- Other: [PERCENTAGE]%

---

## Evidence of Regular Maintenance

### Update History

**[TO BE COMPLETED - Document all releases]**

| Version | Release Date | Type | Key Changes |
|---------|--------------|------|-------------|
| 1.0.0 | [DATE] | Major | Initial public launch |
| 1.1.0 | [DATE] | Minor | Added EVE Mail client |
| 1.1.1 | [DATE] | Patch | Bug fixes for skill notifications |
| 1.2.0 | [DATE] | Minor | Market order management |
| ... | ... | ... | ... |

**Update Cadence:** [Bi-weekly/Monthly] feature releases, immediate hotfixes for critical bugs

### Changelog & Release Notes

All updates documented publicly at: [LINK TO WEBSITE/CHANGELOG]

Example recent release:
```
Version 1.2.0 - Market Order Management (Released: [DATE])

New Features:
- Market order viewing and price monitoring
- Undercut detection with push notifications
- Order history tracking
- Regional market statistics

Improvements:
- Improved skill queue performance
- Enhanced notification reliability
- Updated UI for better tablet support

Bug Fixes:
- Fixed crash when viewing expired orders
- Resolved mail notification duplication
- Corrected timezone handling for skill completion

🤖 Generated with Claude Code (https://claude.com/claude-code)
```

### Bug Fix Responsiveness

- **Average Time to Critical Bug Fix:** <24 hours
- **Average Time to Minor Bug Fix:** <7 days
- **Support Ticket Response Time:** <24 hours
- **Critical Issues Resolved:** [NUMBER] (100% within SLA)

### Development Activity

- **Git Commits:** [NUMBER] commits in last 90 days
- **Active Development:** Daily commits during active sprints
- **Code Quality:** Automated testing, CI/CD pipeline
- **Documentation:** Comprehensive API docs, user guides, developer docs

---

## Community Presence & Engagement

### Reddit (r/Eve)

- **Launch Announcement:** [LINK] ([NUMBER] upvotes, [NUMBER] comments)
- **Regular Update Posts:** [NUMBER] posts, average [NUMBER] upvotes
- **Community Engagement:** Active responses to questions and feedback
- **User Testimonials:** [QUOTE TOP POSITIVE FEEDBACK]

### Discord Community

- **Dedicated Server:** [INVITE LINK]
- **Active Members:** [NUMBER]
- **Daily Messages:** [NUMBER] average
- **Beta Testing Channel:** [NUMBER] active beta testers
- **Support Responsiveness:** <2 hour average response time

### EVE Online Forums

- **Third-Party Developers Section:** [LINK TO POSTS]
- **User Feedback Threads:** [NUMBER] discussions
- **Engagement:** Regular participation in developer community

### Social Media

- **Twitter/X:** [@EVENomadApp] - [NUMBER] followers
- **Regular Updates:** Feature announcements, update notifications
- **User Testimonials:** RT'd positive feedback from players

### App Store Reviews & Responses

- **Total Reviews:** [NUMBER]
- **Developer Response Rate:** [PERCENTAGE]% (we respond to all reviews)
- **Positive Sentiment:** [PERCENTAGE]%

**Example User Testimonial:**
> "[QUOTE POSITIVE REVIEW FROM APP STORE]"

---

## Development Roadmap

### Completed Features (Current Release)

**Free Tier:**
- ✅ Multi-character skill queue monitoring
- ✅ Push notifications for skill completion
- ✅ EVE server status display
- ✅ Basic wallet balances
- ✅ Character overview

**Paid Tier (Omega Companion - $4.99/month):**
- ✅ Full EVE Mail client (archive, search, compose)
- ✅ Market order management with undercut alerts
- ✅ Advanced asset browser with search
- ✅ Industry & PI dashboard with completion notifications

**Infrastructure:**
- ✅ OAuth 2.0 authentication with ESI
- ✅ Backend caching layer (respects ESI cache headers)
- ✅ Push notification infrastructure
- ✅ Subscription management (Stripe + Apple IAP + Google Play Billing)
- ✅ Analytics and error tracking

### Current Development (3-Month Outlook)

**[TO BE UPDATED based on current sprint]**

- 🔄 Widget support for iOS/Android home screens
- 🔄 Offline mode improvements
- 🔄 Advanced filtering for assets and market orders
- 🔄 Character comparison tools
- 🔄 Watchlists and favorites

### Planned Features (6-12 Month Vision)

- 📋 Corporation management dashboard (for corp leadership)
- 📋 Fleet notifications and pings
- 📋 Contract browser and management
- 📋 Localization (additional languages)
- 📋 Tablet-optimized UI
- 📋 Calendar and event reminders

### Long-Term Vision

**EVE Online Tool Ecosystem:**
1. **EVE Nomad** (Mobile - Current focus)
2. **The Industrialist's Ledger** (Desktop production planner)
3. **The CEO's Dashboard** (Corp management SaaS)

Our goal is to create a comprehensive suite of EVE tools that solve real pain points while maintaining CCP compliance and sustainable development practices.

---

## CCP Compliance & Good Faith Operation

### Developer License Agreement Adherence

We have created comprehensive compliance documentation (available upon request) covering:

- ✅ Prohibited monetization methods (clearly avoided)
- ✅ Permitted monetization (donations, ads, ISK fees, backend services)
- ✅ Hybrid Freemium model justification (EVE Tycoon model)
- ✅ Backend service justification for all paid features
- ✅ Free tier provides genuine utility (not crippled)

### Monetization Model - "Service Not Data"

**Critical Compliance Principle:**
Users pay for **backend infrastructure services**, NOT for ESI data access.

**Our Backend Services:**
- Cloud storage for mail archives and historical data
- Real-time push notification infrastructure (24/7 monitoring)
- Search indexing and aggregation algorithms
- Multi-character data consolidation
- Background job processing for alerts
- Server hosting, databases, and ongoing development

**Free Tier Access:**
- All ESI data remains freely accessible
- Users can accomplish meaningful tasks without paying
- Free tier demonstrates value before asking for payment

### Terms of Service & Privacy Policy

- ✅ Clear disclaimer: Not affiliated with CCP Games
- ✅ EVE Online © CCP Games properly attributed
- ✅ GDPR-compliant privacy policy
- ✅ User data rights (access, deletion)
- ✅ Transparent subscription terms
- ✅ No dark patterns for cancellation

### Ongoing Commitment

- Regular updates and maintenance (demonstrated track record)
- Active community engagement and support
- Responsive to CCP policy changes
- Open communication with player community
- Sustainable business model ensuring long-term support

---

## Why EVE Nomad Deserves Partnership

### 1. Solves Critical Community Need

Mobile app abandonment is a well-documented pain point in the EVE community. EVE Nomad fills this gap with:
- Modern, polished UX that respects current design standards
- Reliable performance and regular updates
- Active community support and engagement

### 2. Demonstrates Professional Development Practices

- Comprehensive CCP compliance documentation
- Regular update cadence and changelog transparency
- Public development roadmap
- Active bug tracking and resolution
- Professional support infrastructure

### 3. Contributes to EVE Ecosystem Health

- Free tier ensures accessibility for all players
- Sustainable monetization ensures long-term maintenance
- Community-driven development (feedback incorporated)
- Builds on EVE's third-party developer legacy

### 4. Proven User Growth & Engagement

- [NUMBER] MAU (exceeds 1,000 minimum requirement)
- [PERCENTAGE]% month-over-month growth
- [RATING]/5 app store ratings
- Active, engaged community of beta testers and advocates

### 5. Alignment with CCP's Vision

- Enhances player experience and retention
- Demonstrates proper ESI usage and compliance
- Maintains good standing with CCP policies
- Contributes positively to EVE community discourse

---

## What We Would Bring to the Partner Program

### Active Engagement

- **Feedback on ESI Changes:** As active API users, we can provide valuable feedback on new ESI routes during early access periods
- **Developer Community Participation:** Share learnings with other third-party developers
- **CCP Communication:** Report bugs, suggest improvements, collaborate on API evolution

### Community Growth

- **User Testimonials:** Promote official CCP content to our user base ([NUMBER] MAU)
- **EVE Store Creator Code:** Drive revenue through WeHype partnership
- **SKIN Giveaways:** Use monthly Media Miasma SKINs for user engagement and retention
- **Positive Representation:** Professional, compliant tool reflects well on EVE ecosystem

### Marketing Amplification

- **Social Media:** Share official EVE announcements with followers
- **App Notifications:** Alert users to EVE events, updates, expansions
- **In-App Promotion:** Feature official EVE content and news

---

## Application Supporting Materials

### Screenshots

**[TO BE ATTACHED: 5-10 high-quality screenshots showing:]**
1. Skill queue monitoring dashboard
2. EVE Mail client interface
3. Market order management
4. Asset browser with search
5. Industry/PI dashboard
6. Push notification examples
7. Settings and subscription management

### Demo Video

**[TO BE ATTACHED: 2-3 minute video showing:]**
- App overview and key features
- User experience flow
- Value proposition demonstration
- [LINK TO YOUTUBE/UNLISTED VIDEO]

### User Testimonials

**[TO BE COMPILED: 5-10 positive user testimonials from:]**
- App store reviews (iOS/Android)
- Reddit comments
- Discord feedback
- Email testimonials from beta testers

### Press & Community Coverage

**[IF APPLICABLE: Links to any community coverage:]**
- Reddit posts about EVE Nomad
- EVE news site mentions (INN, EN24, etc.)
- YouTube reviews from content creators
- Forum discussions

---

## Contact Information

**Developer Team Lead:** [YOUR NAME]
**Email:** [CONTACT EMAIL]
**Website:** [PROJECT WEBSITE URL]
**Discord:** [DISCORD SERVER INVITE]
**Twitter/X:** [@EVENomadApp]
**Support:** [SUPPORT EMAIL]

**EVE Online Account:** [YOUR CHARACTER NAME] (in good standing since [YEAR])

---

## Conclusion

EVE Nomad represents a modern solution to a critical gap in the EVE Online ecosystem. We are committed to professional development practices, CCP compliance, and long-term community support. With proven user growth, regular maintenance, and active community engagement, we believe EVE Nomad would be a valuable addition to the EVE Online Partnership Program.

We look forward to the opportunity to work more closely with CCP Games and the broader EVE developer community.

**Thank you for your consideration.**

---

*This application will be submitted via the official EVE Partner Program form at https://www.eveonline.com/partners*

*Prepared using template from `Docs/EVE_Partner_Program_Application_Template.md`*
