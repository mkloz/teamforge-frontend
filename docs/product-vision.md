# TeamForge - Product Vision Document

**Version 2.0 | Strategic Product Documentation**

---

## Executive Summary

TeamForge is an intelligent social platform that algorithmically forms small, compatible groups of people for shared real-world activities. The platform targets students and young professionals aged 18-28 who want to meet like-minded people without the friction of traditional social discovery.

**Core Value Proposition:** Press one button ("Forge my group") and receive one algorithmically selected, compatible group. No endless scrolling, no random matching - every connection is purposeful and computed.

---

## 1. The Problem We Solve

### The Loneliness Gap

The difference between a fulfilling social life and isolation often comes down to having 3-5 people to do things with. Modern social platforms have paradoxically made this harder:

| Problem | Traditional Solutions | Why They Fail |
|---------|----------------------|---------------|
| **Decision fatigue** | Dating apps, social discovery apps | Endless swiping, infinite choices, no decisions made |
| **Surface-level matching** | Interest-based communities | Shared interests don't predict compatibility |
| **Passive engagement** | Social media feeds | Consumption without connection |
| **Group formation friction** | Manual coordination | Requires existing social capital |
| **Trust uncertainty** | Anonymous platforms | No accountability, safety concerns |

### Our Insight

The best social connections happen when compatible people gather around a shared activity with a clear plan. TeamForge automates the hardest part: finding who those compatible people are.

---

## 2. Target Audience

### Primary Demographic

| Attribute | Specification |
|-----------|---------------|
| **Age** | 18-28 years old |
| **Life stage** | Students and young professionals |
| **Geography** | Urban and suburban areas with sufficient user density |
| **Psychographic** | Curious, activity-oriented, open to new connections |

### User Personas

#### The New Arrival
- Recently moved to a new city for university or work
- Has interests but no local friends who share them
- Wants authentic connections, not superficial networking
- Pain point: Starting from zero social capital

#### The Interest Enthusiast
- Has specific hobbies (hiking, board games, photography)
- Existing friends don't share these interests
- Wants activity partners, not just friends
- Pain point: Can't find compatible hobby partners

#### The Social Catalyst
- Naturally organizes gatherings
- Wants to meet new people and introduce them
- Values diverse perspectives
- Pain point: Always the one doing the work

#### The Selective Connector
- Values quality over quantity in relationships
- Skeptical of random matching
- Appreciates data-driven recommendations
- Pain point: Doesn't trust generic social apps

---

## 3. Unique Selling Points

### 1. One-Button Group Formation

The "Forge my group" interaction is radically simple:
- User selects what they want to do
- Algorithm assembles the optimal group
- User receives one recommendation (not a list)
- Accept or decline - no analysis paralysis

### 2. Embedded Personality Profiling

Unlike competitors who match on one dimension, TeamForge uses embedded personality profiling as a core differentiator. Users complete a questionnaire during onboarding that determines their 4-letter personality type code, enabling nuanced compatibility matching based on cognitive preferences and social styles.

| Factor | Weight | Purpose |
|--------|--------|---------|
| **Personality type compatibility** | High | Core psychological alignment (4-letter type code) |
| **Interest similarity** | High | Ensures shared activity enjoyment |
| **Social graph proximity** | High | Prioritizes friend-of-friend connections |
| **Age alignment** | Medium | Groups people at similar life stages |
| **Trust score** | High | Rewards reliable participants |
| **Location proximity** | Variable | Enables in-person activities |

### 3. Activity-Centric Design

Groups form around specific activities with plans, not abstract "matching":
- Every group has a concrete plan (what, when, where)
- Plans can be collaboratively refined
- Activities complete, providing closure and rating opportunities
- Groups can persist beyond a single activity or naturally conclude

### 4. Trust Economy

The exponential-smoothing trust score creates accountability:
- New users start at neutral (0.5)
- Positive interactions increase trust over time
- Negative behavior has consequences but can be recovered from
- Trust is visible to other users
- High-trust users get priority in matching

### 5. No Algorithmic Exploitation

TeamForge doesn't optimize for engagement metrics that harm users:
- No infinite scroll
- No variable reward schedules
- Limited daily searches (3)
- Clear, honest empty states
- Algorithm serves users, not advertisers

---

## 4. Competitive Landscape

### Direct Competitors

| Competitor | Approach | TeamForge Advantage |
|------------|----------|---------------------|
| **Meetup** | Event-based, large groups | Smaller, curated groups with compatibility matching |
| **Bumble BFF** | Dating-app UX for friends | Activity-centric, group-based (not 1:1) |
| **Peanut** | Niche communities | Broader interest coverage, algorithmic curation |
| **Hey! VINA** | Women-only friendship app | Gender-inclusive, activity-focused |

### Indirect Competitors

| Category | Examples | TeamForge Differentiation |
|----------|----------|---------------------------|
| **Social media** | Instagram, TikTok | Real-world activities, not content consumption |
| **Dating apps** | Tinder, Hinge | Friendship and group focus, not romantic |
| **Community platforms** | Discord, Reddit | Curated matching, real-world activation |
| **Event platforms** | Eventbrite, Facebook Events | Algorithmic group formation, not just discovery |

### Competitive Moat

1. **Data advantage**: Trust scores and compatibility data compound over time
2. **Network effects**: More users = better matching within each interest/location
3. **Brand positioning**: "Intelligent" vs. "social" - appeals to skeptical users
4. **UX philosophy**: Deliberate constraints (3 searches/day) create scarcity value

---

## 5. Core Principles

### Intentionality Over Volume

Every interaction should be purposeful. The platform resists the temptation to show more options, send more notifications, or maximize session time.

### Trust as Currency

The trust score is not a gamification mechanic - it's the moral spine of the system. Users who show up, participate, and treat others well earn social capital.

### Activities Create Bonds

Abstract "matching" doesn't work. Shared experiences around concrete activities build real relationships. The plan is the catalyst.

### Complexity Serves Simplicity

The algorithm is sophisticated so the user experience can be effortless. Users never see the math - they just get recommendations that feel right.

### Growth Through Quality

Sustainable growth comes from users who have good experiences and tell others. Viral loops that compromise quality are rejected.

---

## 6. Success Metrics

### North Star Metric

**Completed activities per active user per month**

This captures:
- Users are finding compatible groups
- Groups are forming successfully
- Plans are being executed
- The full value loop is working

### Supporting Metrics

| Category | Metric | Target |
|----------|--------|--------|
| **Acquisition** | New user signups | Growth month-over-month |
| **Activation** | Onboarding completion rate | >80% |
| **Engagement** | Forge button clicks per user/week | 2-3 |
| **Retention** | 30-day retention | >40% |
| **Revenue** | (Future) Premium conversion rate | TBD |
| **Trust** | Average trust score of active users | >0.6 |
| **Quality** | Post-activity rating average | >4.0/5.0 |

### Anti-Metrics (Things We Don't Optimize)

- Time spent in app (we want efficient experiences)
- Number of groups joined (quality over quantity)
- Messages sent (activity completion matters more)
- Daily active users without activity completion

---

## 7. Business Model (Planned)

### Phase 1: Growth (Current)

Free tier with core functionality:
- 3 Forge searches per day
- Full group participation
- Standard matching algorithm

### Phase 2: Monetization

**Premium tier** (tentative):
- Unlimited Forge searches
- Advanced filters (age range, distance precision)
- Priority in matching queue
- Group size preferences
- Analytics on compatibility factors

**Potential additional revenue**:
- Verified badge for institutions (universities, companies)
- B2B partnerships for team-building use cases
- Sponsored activity categories (ethical, non-intrusive)

---

## 8. Platform Philosophy

### What TeamForge Is

- A catalyst for real-world connection
- A tool that respects user time and attention
- A trust-based community with accountability
- An activity-centric platform

### What TeamForge Is Not

- A dating app (no romantic matching)
- A content platform (no feeds, no creators)
- A gaming platform (no points, levels, achievements)
- A networking tool (no professional positioning)
- A passive social media (real-world activation required)

### Language Guidelines

| Instead of... | We say... |
|---------------|-----------|
| Match | Group, connection |
| Swipe | Forge, select |
| Like/heart | Trust, appreciate |
| Profile views | Activity interest |
| Followers | Friends, group members |
| Feed | Activity, conversations |
| Level up | Trust grows |
| Achievement | Completed activity |

---

## 9. Long-Term Vision

### Year 1: Foundation

- Launch in 3-5 university markets
- Validate core matching algorithm
- Build trust score dataset
- Achieve product-market fit

### Year 2-3: Scale

- Expand to 20+ markets
- Launch premium tier
- Add interest-specific features
- Build institutional partnerships

### Year 5: Platform

- Become the default for "I want to do X with compatible people"
- International expansion
- API for third-party integrations
- Trust score as a portable reputation

### The Ultimate Goal

TeamForge succeeds when users no longer need it - when they've built the real-world social connections that make the platform unnecessary. Every graduation from the platform is a success story.

---

*For technical architecture, see `architecture-guide.md`. For feature specifications, see `feature-specifications.md`.*
