# Full User Flow Spec

Last updated: 2026-04-29

## Goal

Define the complete TeamForge frontend flow now that the backend is integrated, so the app behaves like one connected product instead of a set of isolated screens.

This spec covers:

- guest vs authenticated behavior
- auth and onboarding branching
- re-entry flows for editing personality and interests later
- deep-linking and browser history
- URL state persistence using `nuqs`
- server state vs UI state responsibilities
- cross-feature navigation expectations

## Product States

Every user should be treated as being in exactly one of these states:

1. `guest`
   - no valid session

2. `authenticated_unverified`
   - session exists but email verification is still required
   - relevant mostly during registration/activation flows

3. `authenticated_missing_personality`
   - session exists
   - no `personalityType` or incomplete OCEAN values

4. `authenticated_missing_interests`
   - personality complete
   - no saved interests

5. `authenticated_ready`
   - personality complete
   - interests saved
   - full app unlocked

All redirects, CTA labels, and route protection should derive from this model.

## Global Route Rules

### Public routes

- `/`
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password/$token`
- `/auth/activate/$token`

Rules:

- Guests can access them normally.
- Authenticated users should not be blindly redirected to `/home`.
- Authenticated users should always be redirected to `getPostAuthRedirectPath(user)`.

This is especially important for:

- users who log in with Google for the first time
- users who verified but have not finished onboarding
- returning users who still need to finish interests or personality

### Onboarding routes

- `/onboarding/personality`
- `/onboarding/interests`

Rules:

- Must support both `initial` onboarding and `edit` mode.
- Guests should not be able to access them directly.
- Authenticated users may access them in two cases:
  - they are required to finish onboarding
  - they intentionally opened them from profile/settings to edit data

### Authenticated app routes

- `/home`
- `/explore`
- `/activity`
- `/profile`
- `/settings`
- `/forge`

Rules:

- Require a valid session.
- Also require `authenticated_ready`.
- If personality or interests are missing, redirect to the appropriate onboarding step.

## Canonical Redirect Logic

The entire app should use one redirect decision tree:

1. If no session: `/auth/login`
2. If session but no personality/OCEAN: `/onboarding/personality`
3. If personality complete but no interests: `/onboarding/interests`
4. Otherwise: requested app route or `/home`

This logic should be shared by:

- login success
- Google login success
- activation success
- public-route guards
- app-shell route guard
- unauthorized/session refresh recovery

## Landing Flow

### Guest landing

- Navbar CTA:
  - secondary: `Log In`
  - primary: `Get Started`
- CTA section:
  - primary: `Create Free Account`
  - secondary should not send people to login just to “see how it works”
  - better behavior:
    - scroll to product explainer
    - or open register

### Authenticated landing

If a signed-in user opens `/`, landing should adapt instead of pretending they are a guest.

Expected behavior:

- Navbar CTA becomes:
  - secondary: `Home`
  - primary: `Open TeamForge`
- If user is incomplete:
  - show `Continue Onboarding`
- If user is fully onboarded:
  - show `Go to Home`

This avoids the awkward state where authenticated users still see guest auth CTAs.

## Auth Flows

### Email login

Flow:

1. user opens `/auth/login`
2. enters credentials
3. session is created
4. fetch current user
5. redirect using canonical post-auth logic

### Email registration

Flow:

1. user opens `/auth/register`
2. completes credentials/profile step
3. account is created in unverified state
4. user verifies by OTP
5. session is created
6. redirect to `/onboarding/personality`

### Google auth

Two valid outcomes:

1. returning Google user
   - log in
   - redirect by canonical logic

2. first-time Google user
   - create account/session
   - if backend profile is partial, send to onboarding/personality
   - if personality exists but interests do not, send to onboarding/interests

Google auth must not bypass onboarding.

### Activation link

Flow:

1. user opens `/auth/activate/$token`
2. backend activates account
3. if tokens/session are available, fetch current user
4. redirect by canonical logic

### Forgot password / reset password

Flow:

1. guest opens `/auth/forgot-password`
2. submits email
3. email sent confirmation
4. user opens `/auth/reset-password/$token`
5. submits new password
6. redirect to `/auth/login` with success state

Recommended URL state:

- `?reset=success`

## Onboarding Flows

## Initial onboarding

### Personality

Entry sources:

- post-login
- post-registration
- post-activation
- post-Google-auth

Completion:

- persist personality data
- redirect to `/onboarding/interests`

### Interests

Completion:

- persist interests
- enter completion blueprint
- continue to `/home`

History rule:

- onboarding completion redirects should generally `replace`, not `push`
- users should not land back on OTP or pre-onboarding auth screens by pressing Back repeatedly

## Edit onboarding

Users must be able to revisit onboarding later without pretending they are “new”.

### Personality edit mode

Entry sources:

- Settings
- Profile

Recommended route:

- `/onboarding/personality?mode=edit&returnTo=/settings`

Behavior:

- same test flow
- final CTA becomes `Save Personality`
- after save, return to `returnTo`

### Interests edit mode

Recommended route:

- `/onboarding/interests?mode=edit&returnTo=/settings`

Behavior:

- prefill from current user interests
- completion CTA becomes `Save Interests`
- after save, return to `returnTo`

## Settings Flow

Settings should not just display that personality/interests come from onboarding. It should link to them directly.

Expected actions:

- `Edit personality profile` -> `/onboarding/personality?mode=edit&returnTo=/settings`
- `Edit interests` -> `/onboarding/interests?mode=edit&returnTo=/settings`
- `View profile` -> `/profile`

## Profile Flow

Profile should support:

- current profile view at `/profile`
- public user profile view as a future-safe route:
  - recommended: `/profile/$userId`

Cross-links:

- clicking a member in `activity`, `group detail`, `explore`, or `home` should eventually resolve to either:
  - side panel in context
  - or full route `/profile/$userId`

Rule:

- panel views are local context
- full profile routes are stable destinations suitable for sharing/history

## Home Flow

Home is the main post-onboarding hub.

Expected navigation:

- recommended group -> `/explore` with preselected target or filter context
- invitation -> `/activity?kind=group&id=<groupId>` after accept
- group tile -> `/activity?kind=group&id=<groupId>`
- plan tile -> `/activity?kind=group&id=<groupId>&plan=<planId>`
- friends invitation -> relevant flow when implemented

## Explore Flow

Explore should behave like a browsable stateful route, not a local-only screen.

Recommended `nuqs` URL state:

- `q`
- `category`
- `sort`
- `city`
- `size`
- `availability`

Example:

- `/explore?q=basketball&category=sports&sort=compatibility`

Rules:

- filter/search changes should persist in URL
- back/forward should restore the exact filter state
- joining a group should preserve the user’s list state

## Activity Flow

This is the biggest current UX gap. Activity should be fully deep-linkable.

Recommended base route remains:

- `/activity`

Recommended `nuqs` state:

- `kind=group|dm`
- `id=<conversationId>`
- `panel=group|profile|none`
- `message=<messageId>` for jump-to-message
- `media=<attachmentId>` for media lightbox
- `q=<search>`
- `filter=all|groups|dm`
- `density=default|compact`

Example:

- `/activity?kind=group&id=grp_123`
- `/activity?kind=dm&id=chat_88&panel=profile`
- `/activity?kind=group&id=grp_123&message=msg_90`

Rules:

- selecting a conversation should update the URL
- refreshing the page should restore the same conversation
- browser Back should move through conversation history, not drop the user to a blank list unexpectedly
- panel toggles should usually use `replace`, not `push`
- media lightbox can use `replace` for open/close unless direct linkability is explicitly desired

## Forge Flow

Forge currently behaves like a local wizard inside `/forge`. It should become resumable and navigable.

Recommended `nuqs` state:

- `open=true|false`
- `step=1..6`
- `mode=auto|manual`
- `activityId`
- `groupId`

Examples:

- `/forge?open=true&step=2&mode=auto`
- `/forge?open=true&step=4&mode=manual&activityId=act_123`

Rules:

- entering the wizard should update URL state
- changing steps should update URL state
- canceling should clear wizard query state
- browser Back inside forge should step backward before exiting the whole feature
- success should move user into the resulting `activity` route when appropriate

## Notifications Flow

Notifications should be navigational, not informational only.

Each notification type should map to a concrete destination:

- invite accepted -> `/activity?kind=group&id=<groupId>`
- new message -> `/activity?kind=dm&id=<chatId>&message=<messageId>`
- plan proposal -> `/activity?kind=group&id=<groupId>&panel=group&plan=<planId>`
- explore/join updates -> `/explore` or `/activity`

Unread/read state stays server-backed, but the click target must be deterministic.

## Logout Flow

Flow:

1. user signs out
2. session cleared
3. current-user cache cleared
4. redirect to `/`

Rule:

- if sign-out happens due to refresh failure or 401 recovery, the app should redirect to `/auth/login?reason=session-expired`

## URL State Strategy with `nuqs`

`nuqs` should own route-level UI state that must survive:

- refresh
- back/forward
- deep-linking
- shared URLs

Recommended use:

- `activity` selected conversation and panels
- `explore` filters/search/sort
- `forge` open step and mode
- `settings` active tab if settings becomes multi-tab
- onboarding edit mode and return target
- auth success/error banners when useful

Do not use `nuqs` for:

- animation-only state
- drag state
- temporary hover state
- in-progress text drafts unless there is a strong UX reason

## Persistence Rules

### Server-backed

- auth/session
- current user
- profile
- interests
- personality
- groups/chats/messages/plans/notifications

### URL-backed via `nuqs`

- route selection state
- filters
- wizard step state
- edit-mode routing state

### In-memory only

- animation state
- open dropdowns
- temporary unsaved local form edits
- transient panel transitions

No persistent app state should depend on `localStorage` or `sessionStorage`.

## History Rules

### Use `push`

- switching selected conversation
- switching forge step when user explicitly advances/backs
- changing explore filters if the user is intentionally browsing

### Use `replace`

- automatic redirect corrections
- auth success/error helper params
- panel open/close when it is just local chrome
- onboarding completion redirects

## Current Gaps Found in Code

1. `router.tsx`
   - `redirectAuthenticatedUser()` sends authenticated users to `/home`
   - this should use `getPostAuthRedirectPath(user)` instead

2. Landing
   - navbar and CTA are always guest-oriented
   - no authenticated or incomplete-onboarding variant

3. Onboarding
   - uses `window.location.assign` and `window.location.href`
   - no explicit edit mode or `returnTo`

4. Settings
   - no direct links to edit personality/interests through onboarding

5. Activity
   - selected conversation and side panels are not URL-backed

6. Forge
   - wizard state is not URL-backed

7. `nuqs`
   - installed, but not used yet

## Recommended Implementation Order

1. Fix auth/public-route redirect behavior
   - use canonical post-auth redirect everywhere

2. Add onboarding edit mode + `returnTo`
   - personality
   - interests
   - settings links

3. Make landing auth-aware
   - navbar
   - CTA section

4. Add `nuqs` to `activity`
   - conversation selection
   - panel state
   - search/filter/density

5. Add `nuqs` to `explore`
   - search and filters

6. Add `nuqs` to `forge`
   - wizard open state
   - step
   - mode

7. Add notification deep-link destinations

8. Normalize history behavior
   - `push` vs `replace` rules across these flows

## Definition of Done

TeamForge has a complete frontend flow when:

- authenticated users never see guest-only CTA behavior by mistake
- all auth entrypoints land on the correct next step
- onboarding can be both completed and edited later
- activity and forge are refresh-safe and URL-addressable
- explore filters survive reload and back/forward
- settings/profile/home/notifications all link into the right downstream flows
- route and history behavior feels intentional rather than accidental
