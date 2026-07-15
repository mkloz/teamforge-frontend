# TeamForge - Growth Strategy & Product Roadmap

**Version 2.0 | Strategic Planning Document**

> **Status:** Historical strategy and planning material. Dates, targets, premium features, staffing plans, and market assumptions are not current commitments. Confirm them with product leadership before implementation or publication.

---

## Executive Summary

This document records earlier growth, roadmap, and go-to-market plans. Use it as planning context, not as an implementation inventory.

---

## 1. Growth Strategy

### 1.1 Market Entry: University-First Approach

**Why Universities?**

| Factor | Advantage |
|--------|-----------|
| **Density** | High concentration of target demographic (18-28) |
| **Need** | New students actively seeking social connections |
| **Word of mouth** | Tight social networks help information spread |
| **Seasonality** | Clear onboarding windows (semester starts) |
| **Trust** | Institutional affiliation adds credibility |

**Launch Strategy:**

```
Phase 1: Single Campus Pilot
├── Partner with 1-2 student organizations
├── 500-1000 initial users
├── Validate core matching algorithm
└── Gather qualitative feedback

Phase 2: Multi-Campus Expansion
├── 5-10 universities in same region
├── Cross-campus matching for regional activities
├── Ambassador program
└── Refine onboarding funnel

Phase 3: Regional Scaling
├── 50+ universities
├── City-level matching (beyond campus)
├── Premium tier introduction
└── B2B university partnerships
```

### 1.2 User Acquisition Channels

| Channel | Strategy | Expected CAC |
|---------|----------|--------------|
| **Campus ambassadors** | Students promoting in-person | Low |
| **Student organizations** | Partnerships with clubs | Low |
| **Social media** | Organic content, testimonials | Medium |
| **Referral program** | Invite people who may want to join | Low |
| **University partnerships** | Official orientation programs | Very Low |
| **Targeted ads** | Instagram/TikTok to 18-28 | Medium-High |

### 1.3 Retention Mechanics

| Mechanic | Implementation |
|----------|----------------|
| **Activity completion** | Natural closure creates satisfaction |
| **Trust accumulation** | Participation history encourages reliable follow-through |
| **Social graph** | Existing friends make the product more useful |
| **Notification cadence** | Balanced alerts for new opportunities |
| **Seasonal prompts** | Contextual nudges (weekend plans, etc.) |

### 1.4 Network Effects

TeamForge depends on having enough available people in each area:

- More available users in a city provide more possible groups
- Broader interest coverage supports more activity types
- Higher local density can reduce travel distance
- More participation history provides more reliability data

**Critical Mass Thresholds:**

| Market Size | Minimum Users | Quality Threshold |
|-------------|---------------|-------------------|
| Single campus | 200 | Algorithm can form groups |
| City | 2,000 | Diverse activity coverage |
| Region | 10,000 | Premium viability |

---

## 2. Product Roadmap

### 2.1 Historical MVP snapshot

This section records an earlier planning snapshot. It is not a current implementation inventory; use the source tree, architecture guide, and OpenAPI copy for current behavior.

**Completed Features:**
- User authentication (email + Google OAuth)
- Personality assessment (IPIP-style questionnaire)
- Interest selection and profile setup
- Forge wizard (activity, plan, matching)
- Group management and chat
- Plan collaboration (proposals, voting)
- Direct messaging between friends
- Notification system
- Trust score display

**Known Limitations:**
- Frontend only (backend integration pending)
- Mock data in some areas
- Limited real-time functionality
- No premium tier
- No analytics dashboard

### 2.2 Phase 1: Core Completion (0-3 months)

**Priority: Complete backend integration and launch readiness**

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Backend API integration | Critical | High | Enables everything |
| Realtime messaging (Socket.IO) | Critical | Medium | Core UX |
| Push notifications | High | Medium | Retention |
| Trust score calculation | High | Medium | Reliability input |
| Algorithm tuning dashboard | Medium | Medium | Matching quality |
| Error handling & edge cases | High | Medium | Reliability |
| Performance optimization | Medium | Medium | UX quality |
| Analytics instrumentation | Medium | Low | Insights |

### 2.3 Phase 2: Growth Features (3-6 months)

**Priority: Enable viral growth and improve retention**

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Referral program | High | Medium | Growth |
| More Explore filters and browsing options | High | Medium | Engagement |
| Activity templates | Medium | Low | UX improvement |
| Recurring plans | Medium | Medium | Retention |
| Photo sharing post-activity | Medium | Medium | Engagement |
| Profile updates | Low | Low | Polish |
| Onboarding updates | Medium | Low | Activation |

### 2.4 Phase 3: Monetization (6-12 months)

**Priority: Introduce revenue without compromising UX**

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Premium subscription tier | High | High | Revenue |
| Unlimited Forge searches | High | Low | Premium value |
| Advanced matching filters | Medium | Medium | Premium value |
| Priority matching queue | Medium | Medium | Premium value |
| Verified badges (universities) | Medium | Medium | Trust + B2B |
| Compatibility insights | Low | Medium | Premium value |

### 2.5 Phase 4: Platform Expansion (12-24 months)

**Priority: Expand use cases and market**

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Calendar integration | Medium | Medium | Utility |
| Location sharing (during activity) | Low | High | Safety |
| Public activity feed | Medium | Medium | Discovery |
| Interest-based communities | Medium | High | Engagement |
| Event partnerships | Medium | Medium | Content |
| API for third parties | Low | High | Platform play |
| International expansion | High | Very High | Market size |

---

## 3. Competitor Comparison

### 3.1 Core Differentiators

| Differentiator | Description | Defensibility |
|----------------|-------------|---------------|
| **One group request** | One group request instead of a long result list | Product flow |
| **Several group inputs** | Interests + social graph + trust | Participation history may improve group formation over time |
| **Activity-centric** | Groups form around plans, not abstract matching | Product architecture |
| **Reliability history** | Participation record | Past activity data |
| **Intentional limits** | Earlier plan limited Forge requests to three per day | Product constraint |

### 3.2 Competitor Analysis

#### vs. Meetup

| Dimension | Meetup | TeamForge |
|-----------|--------|-----------|
| Group size | Large (20-100+) | Small (4-8) |
| Curation | None | Algorithmic |
| Organizer burden | High | Low (automated) |
| Compatibility | None | Multi-factor |
| Business model | Organizer pays | User premium |

**TeamForge difference:** Small groups formed around a plan, with less manual coordination.

#### vs. Bumble BFF

| Dimension | Bumble BFF | TeamForge |
|-----------|------------|-----------|
| Formation unit | 1:1 | Group |
| UX model | Profile browsing | One-button |
| Activity focus | After introduction | Before group formation |
| Depth | Surface profiles | Personality + interests |
| Trust | None | Exponential score |

**TeamForge difference:** Group-based planning with activity and profile inputs.

#### vs. Facebook Groups / Discord

| Dimension | FB/Discord | TeamForge |
|-----------|------------|-----------|
| Discovery | Manual search | Algorithmic |
| Group formation | Self-organized | Automated |
| Real-world focus | Variable | Primary |
| Group size | Variable | Fixed small |
| Accountability | Low | Trust score |

**TeamForge difference:** Small groups, concrete activity plans, and participation history.

### 3.3 Long-Term Differentiation

**Short-term (0-12 months):**
- Clear group-forming flow and consistent design
- Clear positioning around forming one small group for a plan

**Medium-term (1-3 years):**
- Trust score data accumulation
- Interest graph depth
- Social graph density in key markets

**Long-term (3+ years):**
- "TeamForge" becomes verb ("let's forge a group")
- Trust score as portable reputation
- Platform integrations and API

---

## 4. Key Metrics & Goals

### 4.1 North Star Metric

**Completed Activities per Active User per Month**

This metric captures:
- Users finding compatible groups (matching works)
- Groups forming successfully (network density)
- Plans being executed (product delivers value)
- People complete the activity they planned

### 4.2 Funnel Metrics

| Stage | Metric | Target |
|-------|--------|--------|
| **Awareness** | Website visits | Growth MoM |
| **Acquisition** | Sign-ups | 1000/month (pilot) |
| **Activation** | Onboarding complete | >80% |
| **Engagement** | Forge attempts/week | 2-3 per user |
| **Retention** | 30-day return | >40% |
| **Referral** | Invites sent per user | >2 |
| **Revenue** | Premium conversion | 5-10% (when launched) |

### 4.3 Quality Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Forge success rate** | >70% | How often Forge forms a group |
| **Post-activity rating** | >4.0/5.0 | How participants rate the completed activity |
| **Plan completion rate** | >60% | Groups follow through |
| **Trust score average** | >0.6 | Community health |
| **NPS** | >50 | Word-of-mouth potential |

### 4.4 Anti-Metrics

These are explicitly **not** optimized:

| Metric | Why We Don't Optimize |
|--------|----------------------|
| Time in app | We want efficient experiences |
| Messages sent | Activity completion matters more |
| Daily active users | Completed activities matter more than daily opens |
| Groups joined | Quality over quantity |
| Notifications clicked | Respect attention |

---

## 5. Possible Future Work

### 5.1 Matching Algorithm Evolution

**Current:** Weighted scoring with greedy group formation

**Future explorations:**
- Cohort-based matching (batch users, optimize globally)
- Temporal patterns (people available same times)
- Activity success prediction (what types work best)
- Dynamic weighting (learn optimal weights per user)

### 5.2 Trust System Enhancement

**Current:** Exponential smoothing on 1-5 ratings

**Future explorations:**
- Activity-type-specific trust (reliable for hikes, not for dinners)
- Decay over inactivity (trust must be maintained)
- Verification tiers (ID verified, university verified)
- Trust recovery mechanics (second chances with conditions)

### 5.3 Activity Suggestions

**Future possibilities:**
- Activity recommendation engine
- Seasonal/weather-aware suggestions
- Local event integration
- AI-generated activity ideas

### 5.4 Social Features

**Future possibilities:**
- Activity memories (shared photos, highlights)
- Group history and reunion suggestions
- "Forge again" with past compatible users
- Interest evolution tracking

---

## 6. Risk Factors & Mitigation

### 6.1 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Cold start problem** | High | High | University partnerships, ambassador program |
| **Algorithm quality** | Medium | High | A/B testing, manual override, feedback loops |
| **Safety concerns** | Medium | Very High | Trust scores, reporting, ID verification |
| **Low engagement** | Medium | High | Notification optimization, re-engagement campaigns |

### 6.2 Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Competitor entry** | Medium | Medium | Improve product reliability and user retention |
| **Platform changes** | Low | Medium | Own channels, diverse acquisition |
| **Economic downturn** | Low | Medium | Free tier always available |
| **Regulatory** | Low | Low | Privacy-first design, GDPR compliance |

### 6.3 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Scaling issues** | Medium | High | Cloud-native architecture, load testing |
| **Data breach** | Low | Very High | Security audits, encryption, minimal data |
| **Algorithm bias** | Medium | Medium | Regular audits, diverse testing |

---

## 7. Team & Resource Needs

### 7.1 Current State

- Frontend application (React + TypeScript)
- Design system and brand identity
- Prisma schema and data model

### 7.2 Immediate Needs (Phase 1)

| Role | Priority | Responsibility |
|------|----------|----------------|
| **Backend Engineer** | Critical | API development, database, real-time |
| **DevOps/Infra** | High | Deployment, monitoring, scaling |
| **Product Designer** | Medium | Iterate on UX, user research |

### 7.3 Growth Phase Needs (Phase 2-3)

| Role | Priority | Responsibility |
|------|----------|----------------|
| **Growth Marketer** | High | User acquisition, retention |
| **Data Analyst** | Medium | Metrics, algorithm tuning |
| **Community Manager** | Medium | Ambassador program, support |
| **Mobile Developer** | Medium | Native apps (iOS, Android) |

---

## 8. Success Definition

### What Success Looks Like

**Year 1:**
- 10,000+ active users across 10+ campuses
- 70%+ Forge success rate
- 4.0+ average post-activity rating
- Validated product-market fit

**Year 2:**
- 100,000+ active users
- Premium tier generating revenue
- Expanding beyond universities to young professionals
- Trust score understood as a record of reliability

**Year 3:**
- 500,000+ active users
- Profitable or clear path to profitability
- "TeamForge" as recognized brand in social tech
- Platform integrations and API

### Long-Term Outcome

TeamForge succeeds when people can form a small group for a specific activity without browsing profiles or coordinating everyone manually. Lasting friendships that eventually make the product unnecessary are still a successful outcome.

---

*For product vision, see `product-vision.md`. For technical details, see `architecture-guide.md`.*
