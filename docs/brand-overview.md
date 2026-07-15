# TeamForge — Brand Overview

**Version 1.1 | For Design, Marketing & Development Teams**

---

## 1. Who We Are

TeamForge forms small groups around shared real-world activities. It began as a university project and is designed for students and young professionals aged 18–28 who want to meet people through a clear activity plan.

This document defines how TeamForge presents itself visually and verbally across every surface.

---

## 2. The Core Idea

TeamForge helps people turn an activity idea into a small group and a plan. A user starts with **"Forge my group,"** chooses the activity and details, and receives one group based on the available compatibility factors.

The product uses a multi-factor scoring system combining:
1. **Embedded personality profiling** (4-letter personality type code)
2. **Interest similarity**
3. **Social graph proximity**
4. **Age alignment**
5. **Exponential-smoothing trust score**

These inputs guide group formation.

---

## 3. Mission Statement

**To eliminate the loneliness gap between wanting to do things and having people to do them with.**

---

## 4. Brand Personality: The Catalyst

TeamForge helps form the group, then lets the members decide what happens next.

| Trait | What it means | What it does NOT mean |
| --- | --- | --- |
| Clear, not technical | Explain the outcome in plain language | Do not show formulas or implementation jargon |
| Warm but not sentimental | Use supportive copy around uncertain or personal steps | Do not sound cutesy or needy |
| Confident but not arrogant | Give one clear recommendation | Let users make the final decision |
| Modern but not trendy | Use the established design system | Do not chase short-lived visual trends |

---

## 5. Core Values

Each value should be reflected in product behavior and copy.

### Intentionality

Group formation considers personality, interests, social proximity, age, and trust. The user receives one group rather than a ranked list.

### Trust

The trust score records reliability over time. Later activity feedback can change the score.

### Belonging

Social graph proximity gives more weight to existing friends and nearby connections when the service forms a group.

### Accessibility

Onboarding collects profile details, the activity feed keeps conversations together, and the Forge wizard guides users through group formation.

### Growth

Personality types are discovery tools, not limiting labels. Trust scores evolve. The system grows with the user as their interests and interactions develop.

---

## 6. Brand Voice

The voice never uses corporate jargon, dating-app language, or game mechanics. It speaks like a knowledgeable peer.

| Context | Tone | Example |
| --- | --- | --- |
| Headline / CTA | Confident, direct | "Find your people, intelligently." |
| Onboarding | Encouraging, curious | "Start the personality assessment." |
| Personality result | Affirming, warm | "You're an ENTJ. You often bring structure and direction to a group." |
| Group formed | Celebratory | "Your group is ready. Here's what you have in common." |
| Empty state | Gentle, activating | "No groups yet. Let's forge your first one." |
| Error / limit | Honest, constructive | "We couldn't form a group with these settings. Adjust them and try again." |

---

## 7. Primary Slogan

> **"Find your people, intelligently."**

### Supporting Slogans by Context

| Surface                  | Copy                                             |
| ------------------------ | ------------------------------------------------ |
| App Store listing        | "Find your people, intelligently."               |
| Onboarding welcome       | "Let's forge something real."                    |
| Primary action button    | "Forge my group"                                 |
| Marketing / social media | "Stop scrolling. Start meeting."                 |
| About page / long format | "Every great story starts with the right group." |

---

## 8. The Logo — Voronoi Nexus

### Concept

The logo is a rounded-square badge with four teal regions meeting around an amber center.

The four regions represent group members. Their different teal opacities (`1.0 / 0.83 / 0.66 / 0.50`) keep them visually distinct, while the amber center marks the group coming together.

The `#FAFAF8` strokes separate the regions, showing distinct members within one group.

### Usage Rules

| Context                | Variant                               | Background        |
| ---------------------- | ------------------------------------- | ----------------- |
| App icon (iOS/Android) | Full badge with `#FAFAF8` background  | Teal or white     |
| Navbar / header        | Symbol only, `showBackground={false}` | Any dark or light |
| Footer                 | Symbol only, `showBackground={false}` | Dark preferred    |
| Pitch deck / print     | Full badge with white background      | White             |
| On teal surfaces       | Full badge with `#FAFAF8` background  | Teal              |

### Minimum Size

- Digital: 20×20px (nav icon context)
- Print: 12mm × 12mm

### Clear Space

Maintain a minimum clear zone equal to half the logo's width on all sides.

### Do Not

- Rotate the logo
- Change any fill color
- Apply a drop shadow to the amber dot
- Use the logo on a busy photographic background
- Stretch or distort the aspect ratio

---

## 9. Wordmark

The wordmark pairs the logo symbol with the product name.

- "**Team**" — displayed in Ink (`#1C1F1D`) or white depending on background
- "**Forge**" — displayed in Forge Teal (`#0D9488`)
- Product UI and live-text wordmark: Inter, Bold (700)
- Fixed wordmark artwork may retain Plus Jakarta Sans as a brand-asset exception; do not load it for product UI
- No letter-spacing adjustments

On dark backgrounds, "Team" uses `rgba(255,255,255,0.5)` and "Forge" uses `#0D9488`.

---

## 10. Brand Archetype Reference

TeamForge is **The Catalyst**: it helps form the group, then steps back. The members remain in control.

---

_For visual specifications — colors, typography, spacing, components — see `visual-style-guide.md`._
