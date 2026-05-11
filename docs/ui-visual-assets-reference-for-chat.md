# TeamForge UI Visual Assets Reference

Generated: 2026-05-10

Use this document as the current reference for generating TeamForge UI visuals in another chat. It supersedes earlier visual prompt notes where they conflict.

## Goal

TeamForge needs in-app visuals that make the product feel less soulless without turning it into generic SaaS art, stock lifestyle imagery, sci-fi interface decoration, or abstract symbolism.

The target is not "more creative rendering." The target is:

```text
Stable visual style, better concept choices.
```

Keep the rendering language close to the approved picks. Be more thoughtful and varied in what each visual shows.

## Product Context

TeamForge is a social app for forming small, compatible groups around real-world activities. The audience is mostly students and young professionals aged 18-28.

The audience is skeptical of fake, corporate, overly polished, or generic AI visuals. The visuals should feel:

- clear
- social
- app-native
- warm but not childish
- confident but not corporate
- concrete before symbolic

The app promise is social friction relief: "I want to do something, but I need the right people."

## Current Visual Style Target

Name:

```text
TeamForge dark 2D outline spot illustration
```

Core traits:

- dark or black background
- thick white outline
- simple 2D line illustration
- mostly black/no-fill interiors
- selected teal filled surfaces
- tiny amber status or action accents
- rounded geometry
- clear silhouette
- readable at empty-state size
- app-native, not marketing-poster style
- no text inside the image

The visual should look like it belongs near TeamForge activity cards: high-contrast, bold, direct, and slightly tactile.

## Palette Target

For dark versions, aim for:

- 60-65% black or no-fill negative space
- around 30% teal
- 5-10% amber
- white used for outlines only

These are guide ratios, not math requirements. A concept can shift slightly if the image still feels black-heavy and TeamForge-native.

Important color notes:

- Teal should be a meaningful filled surface, active object, selected part, or action path.
- Amber should mark a real status, action, pin, warmth point, "ready" cue, or attention point.
- Amber should not be a token sparkle/checkmark just to prove the palette was used.
- Avoid teal taking over the whole image.
- Avoid gradients, glow, 3D lighting, or glossy effects.

## Style Anchors

Use these files as style references. Their color ratios are not perfect, but their overall visual style is the best current reference.

Folder:

```text
C:\Users\micha\Documents\petproject\teamforge-frontend\temp\visual-assets-review\my-picks
```

How to use these references:

- Match the outline weight, black background, simple 2D feel, and bold readable shapes.
- Do not copy the exact objects unless they are truly the best fit for the new screen.
- Do not copy their palette balance exactly. The new target is more black-heavy: roughly 60-65% black.

## What Worked

The best references have:

- thick bright outlines
- strong black interiors
- simple centered compositions
- teal used on a small number of important surfaces
- amber used as a small signal
- recognizable app or social objects
- enough visual presence to make an empty state feel intentional

They feel like UI-supporting spot illustrations rather than full scenes or marketing art.

## What Went Wrong

Avoid repeating these mistakes:

1. Generic AI empty-state icons
    - Too minimal, too clean, too "icon pack."
    - Examples of bad direction: simple slots, abstract relay paths, generic rounded status components.

2. Sci-fi or control-panel vocabulary
    - Words like rail, signal, relay, track, endpoint, hatch, and marker pushed the visuals toward futuristic system diagrams.
    - Even when the style was closer, the concept felt wrong for TeamForge's social voice.

3. Overusing repeated motifs by default
    - Rooms, tables, avatars, envelopes, cards, and user circles are not banned.
    - They should only be used when they are actually the clearest concept for that screen.
    - Do not make every visual a room/table/card/avatar variation.

4. Abstract art that makes the user decode meaning
    - The visual should be clear instantly.
    - A small-medium abstract hint is okay, but the main subject should be concrete.

5. Amber as decoration
    - Amber marks should not look like a checkmark, generic sparkle, or palette tax.
    - Use amber where the concept needs attention, warmth, readiness, or status.

6. Too much concept invention
    - Invented mechanical objects became too complex and sci-fi.
    - Creativity should happen in choosing the right grounded metaphor, not inventing lore-heavy devices.

## Motif Guidance

Do not ban motifs. Choose them based on fit.

Good possible motifs:

- pinned notes
- simple boards
- open seats
- activity cards
- plan/proposal boards
- conversation bubbles
- compact social spaces
- grouped slots
- folded slips
- quiet desk or corner elements
- simple paths when they feel human/app-like, not sci-fi

Use carefully:

- rooms
- tables
- avatar circles
- envelopes
- generic cards
- arrows
- lamps
- sparks

Avoid by default:

- futuristic rails
- relay systems
- control panels
- machinery
- network diagrams
- abstract geometric systems
- glossy 3D icons
- fake UI screens with text
- lifestyle photos
- mascots or characters unless specifically approved for a later direction

## Concept Process

For each new visual, do this before generating:

1. Identify the app surface.
    - Example: Empty notifications, empty groups, no plans, no chat, no explore results.

2. Define the user's emotional read.
    - Example: "Nothing needs your attention right now" is better than "system is idle."

3. Propose 3-5 distinct grounded concepts.
    - Concepts should be different in subject, not just small variations.
    - Avoid starting from the previous image's object.

4. Check each concept against the screen.
    - Is it clear without copy?
    - Does it fit TeamForge's social/product voice?
    - Is it too generic?
    - Would it still work at small size?

5. Generate only after the concept direction is approved.

## Prompt Template

Use this as the base prompt for dark versions:

```text
Create a TeamForge in-app empty-state spot illustration in the approved dark 2D outline style.

Style reference: match the provided my-picks references for illustration language only: black background, thick white outlines, flat 2D shapes, rounded geometry, mostly black/no-fill interiors, selected teal filled surfaces, and tiny amber accents. Do not copy their exact objects or layouts.

Subject: [specific grounded concept for this app surface].

Meaning: [the state the user should understand instantly].

Composition: centered standalone spot illustration, 4:3 or square-friendly, readable at small empty-state size, no UI card frame around the entire image unless the concept itself is a card/board/panel.

Palette: roughly 60-65% black/no-fill negative space, around 30% teal, 10% amber. White only for outlines. Teal is used for meaningful filled surfaces. Amber is used only for a real status/action/attention cue. Balance of teal and amber may shift depending on the concept, but don't overdo the colors. At least half of the palette should be black and white (or in light mode, white and black).

Avoid: photorealism, 3D, isometric render, gradients, glow, shadows, glossy highlights, soft lighting, fake UI text, letters, numbers, logos, watermarks, abstract-only art, sci-fi control panel, relay/rail/endpoint system, complex machinery, generic SaaS icon-pack look, random sparkles, amber checkmark decoration.
```

## Notifications Direction Correction

The recent Notifications attempts went wrong because the concepts used system-like language: rail, signal, track, endpoint, lamp. That made the visuals feel slightly sci-fi even when the outline style was closer.

For Notifications / No Updates Yet, use grounded social/app-life metaphors instead.

Better concept territory:

- a quiet pinned notice
- a small clean bulletin board
- a simple blank update slip
- a calm update corner
- a cleared notice surface
- a single pinned note with a small amber status pin
- a small board with no new items

Avoid for Notifications:

- rails
- signal paths
- endpoint diagrams
- relay routes
- futuristic markers
- hatches
- generic bells
- envelopes unless the screen is truly about mail/invites

The desired feeling is:

```text
Nothing needs your attention right now, but the space is alive and ready.
```

Not:

```text
The system relay has no active signal.
```

## Light Version Rule

Once the dark style is approved, every final asset should eventually have a light pair.

Light version should keep:

- same subject
- same composition
- same object layout
- same teal and amber placements

Theme changes:

- background becomes white or warm canvas
- outline becomes black/ink
- black/no-fill areas become white/canvas where needed
- contrast remains high

Do not redesign the concept between light and dark versions.

## Current Working Rule

The next chat should not chase a brand-new illustration style. It should preserve the `my-picks` style and improve concept selection.

Best summary:

```text
Make the idea more thoughtful, not the style more experimental.
```
