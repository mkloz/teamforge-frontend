# TeamForge UI Visual Assets Reference

Generated: 2026-05-11

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
- medium-thick off-white/canvas outline strokes
- simple 2D line and filled-shape illustration
- mostly black/no-fill interiors
- selected teal filled surfaces
- tiny amber status or action accents
- rounded geometry
- clear silhouette
- readable at empty-state size
- app-native, not marketing-poster style
- no text inside the image
- square-friendly composition unless the target component is explicitly wide
- tight but safe crop, with no clipped edge objects and no giant export padding

The visual should look like it belongs near TeamForge activity cards: high-contrast, bold, direct, and slightly tactile.

## Palette Target

For dark versions, aim for:

- 60-70% black or no-fill negative space
- 15-25% off-white/canvas outlines and surface strokes
- 10-20% teal filled surfaces
- 3-8% amber status/action accents
- no extra colors

These are guide ratios, not math requirements. A concept can shift slightly if the image still feels black-heavy and TeamForge-native.

Important color notes:

- Teal should be a meaningful filled surface, active object, selected part, or action path.
- Prefer teal as a filled section, tile, board, seat, note, table mat, or selected surface.
- Do not make teal a gradient, glow, background wash, or a stroke segment that stops halfway through a route.
- Amber should mark a real status, action, pin, warmth point, "ready" cue, or attention point.
- Amber should not be a token sparkle/checkmark just to prove the palette was used.
- Avoid teal taking over the whole image.
- Avoid gradients, glow, 3D lighting, or glossy effects.

## Geometry, Stroke, and Crop Rules

These rules matter as much as the concept. Most failed variants broke one of these.

- Use a square `1:1` visual for empty states, error states, 404 spot art, and forge success art unless the target component is explicitly wide.
- For wide hero-right visuals, use a wide composition such as `2.1:1` or `2.3:1`, but keep the artwork centered and readable when cropped into a desktop panel.
- The actual artwork should occupy about 82-90% of the canvas.
- Leave a 6-10% safe margin around the outermost visible objects.
- Do not let any object touch or disappear behind the image edge.
- Do not export a tiny drawing inside a huge black square.
- Avoid huge black borders/padding unless the surrounding app component explicitly needs them.
- Outline strokes should feel medium-thick, not chunky. On a 2048px generated image, aim for about 18-20px off-white strokes. Avoid 30px+ strokes.
- Interior detail lines can be a little thinner than the main outline, but they should still read clearly at small UI size.
- Keep corners rounded and tactile. Avoid sharp technical geometry.
- If the output will later become SVG, avoid fuzzy effects, antialias-heavy color blends, gradients, and soft shadows.

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
Create a TeamForge in-app [empty-state/error-state/hero] spot illustration in the approved dark 2D outline style.

Style reference: match the provided approved TeamForge references for illustration language only: black background, medium-thick off-white/canvas outlines, flat 2D shapes, rounded geometry, mostly black/no-fill interiors, selected teal filled surfaces, and tiny amber status/action accents. Do not copy their exact objects or layouts.

Subject: [specific grounded concept for this app surface].

Meaning: [the state the user should understand instantly].

Composition: centered standalone spot illustration, square-friendly unless this is a wide hero component, readable at small UI size. The actual artwork fills about 82-90% of the canvas with a 6-10% safe margin. Nothing is clipped by the image edge. No giant empty black padding. No UI card frame around the entire image unless the concept itself is a card/board/panel.

Linework: off-white/canvas outline strokes should be about 18-20px on a 2048px canvas. Use thinner interior detail only when needed. Avoid chunky cartoon strokes.

Palette: black/no-fill is dominant. Teal is used as meaningful filled surfaces, around 10-20% of the visual. Amber is small but noticeable, around 3-8%, and only marks a real status/action/attention cue. White/off-white is for outlines and necessary surface strokes. No additional colors.

Avoid: photorealism, 3D, isometric render, gradients, glow, shadows, glossy highlights, soft lighting, fake UI text, letters, numbers, logos, watermarks, abstract-only art, sci-fi control panel, relay/rail/endpoint system, complex machinery, generic SaaS icon-pack look, random sparkles, amber checkmark decoration.
```

## Exact Prompt Examples

Use these as paste-ready examples. Change only the subject and meaning when the target screen changes.

### Empty Conversations / No Conversations Yet

```text
Create a TeamForge in-app empty-state spot illustration in the approved dark 2D outline style.

Subject: a pinned group-note board for an empty conversation inbox. Show one large rounded conversation board or pinned note surface, a few compact blank chat slips attached around it, one teal filled pinned note as the active future group, and one small amber pin or notification dot. The image should imply: no conversations yet, but there is a social space ready to start.

Style: black background, black negative-space interiors, medium-thick off-white/canvas outlines, flat 2D rounded geometry, no gradients, no glow, no shadows, no 3D. Outline strokes around 18-20px on a 2048px canvas.

Composition: square 1:1, centered standalone spot illustration, artwork fills 84-88% of the canvas, 6-9% safe margin, no clipped objects, no giant black border. Readable at small empty-state size.

Palette: mostly black/no-fill, off-white outlines, teal only as meaningful filled note/board surfaces, amber only as a real pin/status cue. No fake text, no letters, no numbers, no logos, no watermarks, no decorative sparkles.
```

### Explore Empty / No Open Groups

```text
Create a TeamForge in-app empty-state spot illustration in the approved dark 2D outline style.

Subject: an empty explore stack made of activity invitation slips on a simple surface. Show several rounded blank slips slightly offset like a filtered stack, one teal filled activity slip near the center, and one small amber corner tab or pin that feels like a real attention marker. The image should imply: there are no open groups to browse right now, but the explore space is ready.

Style: black background, flat 2D, medium-thick off-white/canvas outlines, rounded geometry, tactile app-native shapes. Use black interiors and negative space. No gradients, no glow, no 3D, no fake UI text.

Composition: square 1:1, centered, square-friendly, artwork fills 84-88% of the canvas with a safe 6-9% margin. Do not crop any slip, tab, or outline. Avoid a generic SaaS empty-card icon.

Palette: 60-70% black/no-fill, 10-20% teal filled surfaces, 3-8% amber accent, off-white outlines only. Teal is a filled slip/surface, not a route stroke or background gradient.
```

### Network Retry Error

```text
Create a TeamForge in-app error-state spot illustration in the approved dark 2D outline style.

Subject: a compact activity table with a disconnected retry token. Show a small teal filled activity card on one side, a blank off-white outlined connection loop that almost reaches a second card, and a small amber repair/status pin at the break. The image should imply: the app tried to reconnect, but the connection needs another attempt.

Style: black background, medium-thick off-white/canvas outline strokes, flat 2D rounded geometry, black/no-fill interiors. No sci-fi network diagram, no relay system, no server rack, no generic warning triangle, no glow.

Composition: square 1:1, centered, artwork fills 82-88% of canvas with safe margins. The connection path should be off-white, continuous, and human/app-like. Do not color only the middle of an arrow or route teal.

Palette: black/no-fill dominant. Teal is only a filled card/token/surface. Amber is the small break/status cue. No fake text, letters, numbers, logos, or watermarks.
```

### Auth Link / Expired or Invalid Link

```text
Create a TeamForge in-app error-state spot illustration in the approved dark 2D outline style.

Subject: an expired invitation link shown as two rounded link plates that no longer meet, with a small teal filled access slip beside them and one amber status pin on the broken join. The image should imply: this auth link cannot be used anymore, but the user can request a fresh one.

Style: black background, flat 2D rounded shapes, medium-thick off-white/canvas outlines around 18-20px on a 2048px canvas, black interiors, no glow, no gradient, no 3D.

Composition: square 1:1, centered, balanced, no clipped edges, no huge black padding. Do not use a large arrow. If direction is needed, use a short off-white gesture line, not a teal arrow.

Palette: mostly black and off-white. Teal is a meaningful filled access slip or link plate. Amber is a small expired/status cue. No text, letters, numbers, logos, watermarks, or decorative sparkles.
```

### 404 / A Group Of One

```text
Create a TeamForge in-app 404 empty-state spot illustration in the approved dark 2D outline style.

Subject: an empty table set for a group, but only one place is present. Show a simple rounded table outline, one teal filled place mat or seat, several missing/open seat outlines as black negative space, and one small amber dead-end pin on the table edge. The image should imply: a group of one, this page is a dead end, return to TeamForge.

Style: black background, medium-thick off-white/canvas outlines, flat 2D, rounded geometry, clear silhouette, no photorealism, no isometric render, no shadows, no glow.

Composition: square 1:1, centered standalone spot illustration, artwork fills 82-88% of canvas, 6-10% safe margin, no clipped table edges or pins. Keep it quiet and readable, not dramatic.

Palette: black/no-fill dominant, teal as the one meaningful filled place/seat/surface, amber as a small real dead-end/status cue. No fake text, no 404 inside the image, no letters, no logos, no watermarks.
```

### Forge Group Ready

```text
Create a TeamForge in-app success-state spot illustration in the approved dark 2D outline style.

Subject: a group-ready arrangement board. Show three to five rounded participant slots around a central teal filled group tile, with one small amber ready marker where the slots visually converge. The image should imply: the group lineup is ready for review.

Style: black background, medium-thick off-white/canvas outline strokes, flat 2D rounded geometry, strong black interiors, app-native tactile shapes. No checkmark icon, no confetti, no sparkles, no 3D, no glow.

Composition: square 1:1, centered, compact, readable at a small card size, artwork fills 82-88% of canvas with safe margins and no clipped edges.

Palette: black/no-fill dominant. Teal is the central filled group tile or selected slots. Amber is one small readiness/convergence cue. No fake text, letters, numbers, logos, or watermarks.
```

### Home Hero Right / Activity Workbench

```text
Create a TeamForge home-page hero-right visual in the approved dark 2D outline style.

Subject: a wide activity workbench. Show a horizontal desktop-right composition with activity cards, a central teal filled planning tile, a few off-white outlined slips or tools, and small amber readiness/status dots where the workbench suggests social activity planning. The image should imply: TeamForge is actively helping the user organize the next shared experience.

Style: black background, flat 2D, medium-thick off-white/canvas outlines, rounded geometry, mostly black/no-fill interiors, selected teal filled surfaces, tiny amber cues. No gradients, no glow-heavy effects, no glossy UI, no fake text.

Composition: wide hero component, about 2.1:1 to 2.3:1, centered within the wide frame. Artwork fills 84-90% of the frame with 6-9% safe margin. Do not place important objects on the edge. Nothing clipped. No giant black border.

Palette: black/no-fill dominant. Teal is used as a filled planning tile or selected workbench surface, not as a background wash. Amber is small but visible as a real status cue. No letters, numbers, logos, watermarks, or decorative sparkles.
```

## Regeneration Prompts For Common Failures

Use these exact correction add-ons when a generated image is close but wrong.

### If The Lines Are Too Thick

```text
Regenerate the same concept with noticeably slimmer off-white/canvas outline strokes. Aim for about 18-20px stroke weight on a 2048px canvas. Keep the same flat 2D rounded TeamForge style, but avoid chunky 30px+ cartoon outlines.
```

### If There Is Too Much Teal

```text
Regenerate the same concept with less teal. Keep teal to meaningful filled surfaces only, around 10-18% of the visual. Do not use teal as a background, glow, gradient, route stroke, or decorative wash.
```

### If There Is Not Enough Teal

```text
Regenerate the same concept with clearer teal filled sections. Teal should fill one or two important surfaces, such as a selected card, note, board, seat, or tile. Do not add teal as a random stroke segment or background gradient.
```

### If Amber Is Barely Visible

```text
Regenerate the same concept with a small but more noticeable amber cue. Amber should mark a real pin, status dot, readiness marker, attention tab, or break point. Do not add sparkles, confetti, or a decorative checkmark.
```

### If The Image Has Huge Padding

```text
Regenerate the same concept with a tighter composition. The actual artwork should fill about 84-88% of the canvas, with only 6-9% safe margin. Do not place a tiny drawing inside a huge black square.
```

### If The Image Is Cropped Or Clipped

```text
Regenerate the same concept with safe margins. Keep every object fully inside the frame, with 6-10% empty space around the outermost visible outlines. No table edges, cards, pins, or outlines should touch or disappear behind the image edge.
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
