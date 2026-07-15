# TeamForge - Product Vision Document

**Version 2.0 | Strategic Product Documentation**

> **Status:** Product direction and historical planning. This is not a current implementation contract. Verify routes and behavior in the source tree and `docs/open-api.yaml`.

---

## Executive Summary

TeamForge forms small groups around real-world activities for students and young professionals aged 18-28.

**Core Value Proposition:** A user starts a group request with **"Forge my group"** and receives one group rather than a list to browse.

---

## 1. The Problem We Solve

### The Loneliness Gap

Many people have activities they want to do but no small group to join them. Common social products do not solve the coordination problem:

| Problem | Traditional Solutions | Why They Fail |
|---------|----------------------|---------------|
| **Decision fatigue** | Dating apps, social discovery apps | Endless browsing, too many choices, no decision made |
| **Interest-only groups** | Interest-based communities | A shared interest does not guarantee a workable group |
| **Passive engagement** | Social media feeds | Consumption without connection |
| **Group setup** | Manual coordination | Requires an existing local network |
| **Trust uncertainty** | Anonymous platforms | No accountability, safety concerns |

### Product Approach

TeamForge forms a small group around a shared activity and a concrete plan. It handles group selection so the user does not have to coordinate everyone manually.

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
- Pain point: Does not know people nearby yet

#### The Interest Enthusiast
- Has specific hobbies (hiking, board games, photography)
- Existing friends don't share these interests
- Wants activity partners, not just friends
- Pain point: Can't find compatible hobby partners

#### The Group Organizer
- Naturally organizes gatherings
- Wants to meet new people and introduce them
- Values diverse perspectives
- Pain point: Usually handles all the coordination

#### The Selective Connector
- Values quality over quantity in relationships
- Skeptical of random matching
- Wants clear reasons for group suggestions
- Pain point: Doesn't trust generic social apps

---

## 3. Product Approach

### 1. Guided Group Formation

The Forge flow asks the user to choose an activity and plan. TeamForge then forms one group from available compatible members, and the user can accept or decline the result.

### 2. Personality Questionnaire

The onboarding questionnaire produces a 4-letter personality type and Big Five trait scores. TeamForge uses both as inputs when forming groups.

| Factor | Weight | Purpose |
|--------|--------|---------|
| **Personality type compatibility** | High | Uses the 4-letter personality type as one group-forming input |
| **Interest similarity** | High | Compares shared activity interests |
| **Social graph proximity** | High | Considers existing social connections |
| **Age alignment** | Medium | Considers age range |
| **Trust score** | High | Considers past participation |
| **Location proximity** | Variable | Considers travel distance for in-person plans |

### 3. Activity-Centric Design

Groups form around specific activities with plans, not abstract "matching":
- Every group has a concrete plan (what, when, where)
- Plans can be collaboratively refined
- Activities complete, providing closure and rating opportunities
- Groups can persist beyond a single activity or naturally conclude

### 4. Reliability Over Time

Activity ratings update the trust score over time. New accounts start at 0.5,
and later ratings can raise or lower the score. This document does not assign
public badges, visibility rules, or group-forming priority to score ranges.

### 5. Limits on Attention Capture

TeamForge doesn't optimize for engagement metrics that harm users:
- No infinite scroll
- No variable reward schedules
- Clear, honest empty states
- Group-forming decisions are not based on advertising goals

---

## 4. Competitive Landscape

### Direct Competitors

| Competitor | Approach | TeamForge Difference |
|------------|----------|---------------------|
| **Meetup** | Event-based, large groups | Smaller groups formed around a shared plan |
| **Bumble BFF** | Dating-app UX for friends | Activity-centric, group-based (not 1:1) |
| **Peanut** | Niche communities | Groups formed around activities across several interest categories |
| **Hey! VINA** | Women-only friendship app | Gender-inclusive, activity-focused |

### Indirect Competitors

| Category | Examples | TeamForge Differentiation |
|----------|----------|---------------------------|
| **Social media** | Instagram, TikTok | Real-world activities, not content consumption |
| **Dating apps** | Tinder, Hinge | Friendship and group focus, not romantic |
| **Community platforms** | Discord, Reddit | Small groups organized around real-world plans |
| **Event platforms** | Eventbrite, Facebook Events | Forms a group instead of only listing events |

### Possible Long-Term Differentiation

1. **Participation history**: Past activity feedback may improve group formation over time
2. **Availability**: More users can provide more group options within an area and interest
3. **Brand position**: Direct group formation for people who do not want another social feed

---

## 5. Core Principles

### Intentionality Over Volume

Every interaction should help the user complete a task. The platform avoids showing more options, sending more notifications, or extending sessions without a user need.

### Reliability over time

The trust score changes with activity feedback over time. It is intended to reflect reliability without creating public rankings.

### Activities give the group a purpose

Shared interests alone do not form a useful group. A specific plan gives people a reason to meet.

### Keep Scoring Details Out of the Main Flow

Users see the proposed group, the plan, and the next action. Technical scoring details stay in developer documentation.

### Growth Through Completed Activities

Sustainable growth comes from users who have good experiences and tell others. Viral loops that compromise quality are rejected.

---

## 6. Success Metrics

### North Star Metric

**Completed activities per active user per month**

This measures whether people form a group, carry out the plan, and complete the activity.

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

### Metrics That Are Not Product Goals

- Time spent in app (we want efficient experiences)
- Number of groups joined (quality over quantity)
- Messages sent (activity completion matters more)
- Daily active users without activity completion

---

## 7. Business Model (Historical Proposal)

Earlier versions proposed free access with a daily Forge quota and a future
premium tier. Neither the quota nor a premium feature set is a current
commitment. Confirm access limits and monetization with product leadership
before implementation or publication.

---

## 8. Platform Philosophy

### What TeamForge Is

- A tool for forming groups around real-world activities
- A tool that respects user time and attention
- A trust-based community with accountability
- An activity-centric platform

### What TeamForge Is Not

- A dating app; TeamForge is for friendship and group activities
- A content platform (no feeds, no creators)
- A gaming platform; TeamForge has no points or progression system
- A networking tool (no professional positioning)
- A passive social feed; the product is built around activities people plan to do

### Language Guidelines

- Describe formation outcomes as a group or connection.
- Use **Forge** or **select** for group-forming actions.
- Describe positive feedback as trust or appreciation.
- Call the main product surfaces activities and conversations.
- Describe progress through completed activities, not scores or rewards.

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

### Long-Term Outcome

Success means users form lasting real-world connections, even when those connections eventually make TeamForge unnecessary.

---

*For technical architecture, see `architecture-guide.md`. For feature specifications, see `feature-specifications.md`.*
