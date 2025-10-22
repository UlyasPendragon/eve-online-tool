# CCP Developer License Agreement Compliance Documentation

**Document Version**: 1.0
**Last Updated**: 2025-01-16
**Project**: EVE Online Tool (EVE Nomad and future products)
**Purpose**: Ensure full compliance with CCP Games' Developer License Agreement and Third-Party Policies

---

## Executive Summary

This document provides comprehensive guidance for developing EVE Online third-party applications in compliance with CCP Games' Developer License Agreement. All EVE Online Tool products must adhere to these policies to maintain API access and avoid violations.

**Key Principle**: Applications are intended for **non-commercial** and **non-profit** use to enhance player enjoyment of EVE Online. Monetization is permitted only through specific approved methods.

---

## 1. Prohibited Activities

### 1.1 Prohibited Monetization Methods

**STRICTLY FORBIDDEN** - The following monetization practices are prohibited under the Developer License Agreement:

❌ **Charging Fees for Application Access**
- Cannot charge real-world currency for accessing the application
- Cannot charge for downloading or installing the application
- Cannot require payment for basic functionality

❌ **Charging for ESI Data Access**
- Cannot sell access to EVE Swagger Interface (ESI) data
- Cannot charge fees to view market data, character information, or any ESI-derived data
- Cannot create paywalls for ESI data display

❌ **Premium Content/Feature Paywalls**
- Cannot lock features behind real-money purchases *unless justified as backend services* (see permitted methods)
- Cannot create "premium" tiers that restrict ESI data access

❌ **Third-Party Gambling**
- Hosting or participating in gambling services using in-game assets, ISK, or EVE IP is **strictly prohibited**
- This includes casinos, lotteries, betting services, or any games of chance
- Violation can result in immediate ban and asset confiscation

❌ **Selling or Licensing Applications**
- Cannot sell the application or its code
- Cannot license the application to other parties for commercial use
- Cannot charge for ownership or distribution rights

❌ **Tying to Other Products/Services**
- Cannot condition application access on purchasing other products
- Cannot bundle application with commercial offerings

### 1.2 Other Prohibited Uses

❌ **Unauthorized Commercial Use**
- Applications must support player enjoyment of EVE
- Cannot use EVE IP for purposes unrelated to the game
- Cannot misrepresent affiliation with CCP Games

❌ **Restricted Access Requirements**
- Cannot require purchases to remove restrictions
- Free tier must provide genuine utility (not crippled functionality)

---

## 2. Permitted Monetization Methods

### 2.1 In-Game Currency (ISK) Fees ✅

**FULLY PERMITTED** - Applications may charge ISK for access or features

**Details**:
- May condition access on payment of EVE's valid in-game currency (ISK)
- ISK can be paid to developer or registered EVE corporation
- No restrictions on ISK pricing or features gated by ISK
- Developer can convert ISK to PLEX to extract real-world value

**Example Use Cases**:
- Monthly ISK subscription for premium features
- One-time ISK payment for application access
- ISK fees for specific services (market analysis, manufacturing calculations)

**Compliance Notes**:
- ISK fees are **not subject to** the same restrictions as real-money fees
- This is a fully compliant revenue generation method
- Conversion: ISK → PLEX → Subscription time (or sell PLEX for ISK)

### 2.2 Voluntary Donations ✅

**FULLY PERMITTED** - May solicit voluntary donations

**Requirements**:
- Donations must be **truly voluntary**
- Application access **cannot be restricted** based on donation status
- Donations should offset maintenance and support costs
- Cannot provide exclusive features to donors (violates "voluntary" requirement)

**Permitted Platforms**:
- Patreon (with no exclusive content tiers)
- GitHub Sponsors
- Ko-fi
- PayPal donation links
- Direct cryptocurrency donations

**Compliance Notes**:
- Clearly state donations are voluntary
- Do not create "donor-only" features
- Use donations for operational costs, not profit extraction
- Can acknowledge donors publicly (credits, thank you page)

### 2.3 Advertising Revenue ✅

**FULLY PERMITTED** - General advertisements allowed

**Requirements**:
- Ads must not interfere with application access or use
- Must be "general" advertising (not EVE-specific scams)
- User experience should not be degraded

**Permitted Ad Types**:
- Google AdSense on website/web app
- Banner ads (non-intrusive)
- Pre-roll video ads on YouTube tutorials
- Sponsor logos/mentions
- Affiliate links (non-restrictive)

**Prohibited Ad Practices**:
- Pop-ups that block application functionality
- Auto-playing video ads with sound
- Ads for EVE RMT (real-money trading) services
- Ads that violate EVE EULA

### 2.4 Subscription for Backend Services ✅

**PERMITTED (Gray Area)** - Charge for value-added services, not data

**The "EVE Tycoon Model"**:
CCP's policies prohibit charging for ESI data access but allow charging for **backend services** that create value beyond raw API calls.

**Permitted Backend Services**:
- ✅ Data storage (historical data not available from current ESI)
- ✅ Server-side processing (complex calculations, analytics)
- ✅ Caching infrastructure (performance optimization)
- ✅ Push notifications (requires backend infrastructure)
- ✅ User account management
- ✅ Data aggregation across multiple characters
- ✅ Custom alerts and monitoring

**Key Justification**:
The subscription fee is for the **service infrastructure**, not for the ESI data itself. Users are paying for:
1. Server hosting costs
2. Database storage
3. Computational processing
4. Notification delivery systems
5. Developer time maintaining infrastructure

**Compliance Framework**:
- Free tier **must** provide access to core ESI data
- Paid tier unlocks features requiring significant backend resources
- Clearly communicate that subscription is for **services**, not data
- Document infrastructure costs and service delivery

**Precedent**: EVE Tycoon successfully operates on this model with CCP's apparent acceptance.

---

## 3. Hybrid Freemium Model - Compliance Strategy

### 3.1 Model Overview

The **Hybrid Freemium** model balances CCP compliance with commercial viability:

**Free Tier** (Compliant Access):
- Provides universal access to ESI data and core features
- No paywalls for basic functionality
- Genuine utility (not trial/crippled version)
- Demonstrates app value

**Paid Tier** (Premium Services):
- Unlocks features requiring backend infrastructure
- Justified by operational costs
- Subscription positioned as "service fee" not "data fee"

### 3.2 EVE Nomad Example - Free vs. Paid Features

**Free Tier ($0/month)**:
- ✅ Multi-character skill queue monitoring
- ✅ Push notifications for skill completion
- ✅ EVE server status display
- ✅ Basic wallet balance view
- ✅ Character overview

*Justification*: These features provide basic ESI data access, fulfilling the "non-restrictive" requirement.

**Paid Tier ($2-5/month - "Omega Companion")**:
- 📧 Full EVE Mail client (backend stores/processes mail)
- 📊 Market order management (backend monitors for undercuts)
- 📦 Advanced asset browser (backend indexes and searches)
- 🏭 Industry/PI dashboard (backend tracks jobs, sends notifications)
- 🎯 Priority support (human labor cost)

*Justification*: Each paid feature requires:
1. **Backend Storage**: Mail archives, order history, asset indexes
2. **Processing**: Search algorithms, notification logic, analytics
3. **Infrastructure**: Databases, job queues, notification servers
4. **Labor**: Ongoing maintenance and support

### 3.3 Compliance Checklist for Feature Development

Before implementing any feature, validate compliance:

**✅ Compliant Feature** | **❌ Non-Compliant Feature**
---|---
Charges for backend service (data storage, processing) | Charges for displaying ESI data
Free tier provides genuine value | Free tier is crippled/useless trial
Subscription justifiable by infrastructure costs | Subscription purely for profit
Clear communication about service costs | Misleading about what user pays for
Optional paid tier for advanced features | Required payment for basic functionality

---

## 4. Decision-Making Framework

### 4.1 New Feature Compliance Test

When proposing a new feature, ask:

**1. Does this feature require ESI data?**
- ✅ Yes → Make it free tier OR justify backend service cost
- ✅ No → Can be paid without ESI restrictions

**2. Can we justify a subscription fee with backend costs?**
- ✅ Significant storage required → Paid tier justifiable
- ✅ Complex processing/analytics → Paid tier justifiable
- ✅ Real-time notifications → Paid tier justifiable
- ❌ Simple API call display → Must be free tier

**3. Would CCP reasonably accept our justification?**
- ✅ We're charging for the service, not the data → Acceptable
- ❌ We're charging to unlock ESI data access → Violation

**4. Is there precedent for this model?**
- ✅ EVE Tycoon charges for profit history (backend storage) → Safe
- ✅ EVE Nomad charges for notifications (backend infrastructure) → Safe
- ❌ Charging for market price display → Violation

### 4.2 Gray Areas Requiring CCP Clarification

If uncertain about a feature, consider seeking CCP clarification:

**Potentially Gray Areas**:
1. **Character limit on free tier** - Is limiting to 2 characters compliant?
2. **Historical data exclusivity** - Can we charge for data we collect that ESI doesn't provide?
3. **API call aggregation** - Is charging for cross-character analytics compliant?
4. **Mobile app subscriptions** - Are platform fees (Apple/Google) acceptable justification?

**Process for Clarification**:
1. Submit question to CCP Developer Support
2. Reference existing precedents (EVE Tycoon, etc.)
3. Document response
4. Update compliance documentation

---

## 5. Operational Compliance Requirements

### 5.1 Application Requirements

**Must Have**:
- Clear statement: "This application is not affiliated with or endorsed by CCP Games"
- Proper attribution of EVE Online and CCP intellectual property
- Link to CCP's official website
- Compliance with CCP's trademark usage guidelines

**Must Not**:
- Misrepresent official affiliation
- Use CCP trademarks inappropriately
- Violate CCP's IP rights

### 5.2 Terms of Service Requirements

Your application's Terms of Service must include:
- Acknowledgment that app is third-party, not official
- Statement that EVE Online © CCP Games
- Disclaimer of warranties
- Limitation of liability
- User responsibilities
- Subscription terms (if applicable)
- Refund policy
- CCP compliance provisions

### 5.3 Privacy Policy Requirements

Must address:
- What ESI data is collected
- How data is stored and used
- Data retention policies
- User data rights (access, deletion per GDPR)
- Third-party services (payment processors, analytics)
- CCP's access to ESI data (it's their data)

---

## 6. Enforcement and Consequences

### 6.1 CCP's Rights

CCP retains **sole discretion** to:
- Determine if monetization violates agreement
- Disable API access immediately without notice
- Revoke developer license
- Pursue legal action for violations

### 6.2 Potential Consequences

**Minor Violations**:
- Warning from CCP
- Requirement to modify monetization
- Temporary API access suspension

**Major Violations** (gambling, flagrant commercial abuse):
- Permanent API access revocation
- Developer ban from EVE ecosystem
- Legal action
- Confiscation of in-game assets
- Public announcement/shaming

### 6.3 Violation Examples from History

**IWI Gambling Scandal (2016)**:
- Third-party gambling sites using ISK
- CCP banned gambling services entirely
- EULA updated to explicitly prohibit gambling
- Developer assets confiscated

**Lesson**: CCP will enforce policies strictly when violations harm the game or player trust.

---

## 7. Best Practices for Compliance

### 7.1 Transparency

✅ **Do**:
- Clearly explain what users pay for (backend services, not data)
- Provide detailed feature breakdown (free vs. paid)
- Communicate operational costs
- Be honest about business model

❌ **Don't**:
- Hide subscription details in fine print
- Mislead about feature requirements
- Obscure what fees are for

### 7.2 Good Faith Operation

✅ **Do**:
- Provide genuinely useful free tier
- Price fairly based on costs
- Prioritize player experience over profit
- Build trust with community

❌ **Don't**:
- Create predatory pricing
- Manipulate users into subscriptions
- Degrade free tier to push upgrades

### 7.3 Community Relations

✅ **Do**:
- Engage with EVE community openly
- Respond to compliance questions
- Be receptive to feedback
- Build reputation for trustworthiness

❌ **Don't**:
- Ignore community concerns
- Defensive about monetization
- Dismiss compliance questions

---

## 8. EVE Nomad Specific Compliance Plan

### 8.1 Free Tier Justification

**Free Features** (ESI data display with minimal backend):
- Skill queue monitoring (read-only ESI data)
- Server status (public ESI endpoint)
- Wallet balance (simple ESI read)

**Compliance**: These features require minimal infrastructure. Providing them free satisfies CCP's "non-restrictive access" requirement.

### 8.2 Paid Tier Justification

**Paid Feature** | **Backend Service Justification**
---|---
EVE Mail Client | Mail storage, indexing, search algorithms, notification delivery
Market Order Management | Order monitoring, undercut detection, price alerts, historical tracking
Asset Browser | Asset indexing, multi-character aggregation, search/filter algorithms
Industry/PI Dashboard | Job tracking, completion notifications, profitability calculations

**Infrastructure Costs**:
- Database hosting: $50-200/month
- Redis caching: $20-50/month
- Push notification service: $10-100/month
- Server hosting: $100-500/month
- **Total**: $180-850/month baseline costs

**Subscription Math**:
- 100 users @ $4.99/month = $499/month
- Covers infrastructure + development time
- Justifiable as "service fee"

### 8.3 Messaging Strategy

**In-App Messaging**:
> "EVE Nomad Omega Companion ($4.99/month) unlocks advanced features requiring significant backend infrastructure including cloud storage, real-time notifications, and 24/7 monitoring services. Your subscription supports server hosting, database management, and ongoing development."

**FAQs**:
- **Q**: Why do you charge for features?
- **A**: "We charge for the backend services that power advanced features, not for ESI data access. Our infrastructure includes servers, databases, and notification systems that require ongoing operational costs."

---

## 9. Monitoring and Updates

### 9.1 Policy Change Monitoring

**Action Items**:
- Subscribe to CCP Developer News
- Monitor EVE Online official announcements
- Join third-party developer Discord/communities
- Review Developer Agreement annually
- Update compliance documentation when policies change

### 9.2 Compliance Audits

**Quarterly Review**:
- Audit all features for compliance
- Review monetization methods
- Update Terms of Service if needed
- Check for new CCP guidance

### 9.3 Documentation Updates

This document should be updated when:
- CCP releases policy changes
- New features are added to EVE Nomad
- Compliance questions are clarified by CCP
- Precedents change (new third-party tools launch)

---

## 10. Resources and References

### 10.1 Official CCP Resources

- **Developer Portal**: https://developers.eveonline.com
- **Developer License Agreement**: https://developers.eveonline.com/license-agreement
- **Third-Party Policies**: https://support.eveonline.com (EULA/ToS section)
- **ESI Documentation**: https://esi.evetech.net/
- **CCP Developer Support**: Via developer portal

### 10.2 Community Resources

- **Third-Party Dev Discord**: (Find current link on r/Eve)
- **r/Eve Subreddit**: https://reddit.com/r/Eve
- **EVE Online Forums**: https://forums.eveonline.com

### 10.3 Precedent Examples

- **EVE Tycoon**: Freemium market/industry tracker (successful monetization model)
- **zKillboard**: Free, donation-supported (community trust example)
- **EVE Guru**: ISK-based subscription model

### 10.4 Research Documentation

- **Market Research**: `Docs/idea research.md` (Lines 77-118: Monetization Strategies)
- **CLAUDE.md**: Project overview and compliance guidelines

---

## 11. Compliance Checklist

Use this checklist for all development decisions:

### Feature Development Checklist

- [ ] Feature requires ESI data? (If yes, consider free tier)
- [ ] Feature justifiable with backend service costs? (Storage, processing, notifications)
- [ ] Free tier still provides genuine value?
- [ ] Pricing reasonable and cost-justified?
- [ ] Messaging clearly explains service fees?
- [ ] Terms of Service updated for new feature?
- [ ] Compliance documentation reviewed?

### Pre-Launch Checklist

- [ ] Developer License Agreement signed
- [ ] Application registered with CCP
- [ ] Terms of Service include CCP disclaimers
- [ ] Privacy Policy addresses ESI data
- [ ] Free tier provides substantial value
- [ ] Paid tier justified by infrastructure
- [ ] Pricing strategy documented
- [ ] Community messaging prepared
- [ ] EVE Partner Program application submitted

### Ongoing Compliance Checklist

- [ ] Monthly policy change monitoring
- [ ] Quarterly compliance audit
- [ ] Annual Terms of Service review
- [ ] User feedback on pricing fairness
- [ ] Infrastructure cost tracking (justifies fees)
- [ ] CCP communication archived

---

## 12. Conclusion

**Compliance is Non-Negotiable**: Violating CCP's Developer License Agreement can result in immediate loss of API access and termination of the project.

**Our Approach**: EVE Online Tool will operate in **good faith** with CCP's policies by:
1. Providing genuine free-tier value
2. Charging only for backend services, not ESI data
3. Transparent communication about costs
4. Building community trust
5. Maintaining ongoing compliance

**When in Doubt**: Err on the side of caution. If a monetization method is questionable, seek CCP clarification or avoid it.

**Success Depends on Compliance**: A sustainable, profitable EVE tool requires both a viable business model AND CCP's continued API access. Compliance ensures long-term viability.

---

**Document Maintenance**: This compliance documentation is a living document and should be updated as policies evolve, features are added, and clarifications are received from CCP.

**Last Review Date**: 2025-01-16
**Next Scheduled Review**: 2025-04-16 (Quarterly)
**Document Owner**: EVE Online Tool Development Team
