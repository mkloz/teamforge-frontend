# Backend Integration Status Report

Last updated: 2026-04-29

## Verdict

From a source-level audit plus successful production builds, the frontend is now backend-integrated for the current user-facing product flow.

What this means:

- Every live product feature route now talks to backend endpoints through feature `*.api.ts` and `*.queries.ts` layers.
- The old mock-backed seams have been removed from the active app flow.
- The frontend and backend both build successfully after the latest auth, activity, forge, onboarding, home, explore, notifications, profile, and settings work.

What this does **not** mean yet:

- This was **not** a full browser-driven UI session across every route.
- Google login still needs an interactive browser-based verification pass.

## Verification Performed

- Audited the active frontend `api/` and `queries/` layers route by route.
- Checked for remaining mock or placeholder integration seams in `src/features` and `src/shared`.
- Built the frontend successfully with `npm run build`.
- Built the backend successfully with `npm run build`.
- Brought up the local backend stack with Docker, migrations, and seeds.
- Ran live API flow checks against `http://localhost:6969/api/v1`.

## Runtime QA Results

### Passed live

- New email registration with OTP verification
  - verification code was created
  - resend produced a fresh code
  - OTP verification returned tokens
  - pre-verification profile fields persisted correctly

- Activation-link account verification
  - activation endpoint accepted a valid token
  - activated account could log in normally afterward

- Forgot password and reset password
  - reset-link request endpoint succeeded for a verified account
  - reset endpoint accepted a valid token
  - login succeeded with the new password

- Forge flows
  - `AUTO` forge created a matched group, chat, and plan
  - `MANUAL` forge created a matched planning group, chat, and plan

### Not runtime-verified yet

- Google login
  - code path is wired
  - build is green
  - endpoint exists and frontend provider is configured
  - but a true end-to-end check still needs an interactive browser Google auth session

## Feature Status

### Integrated

- `auth`
  - Email login
  - Email registration
  - Email verification via OTP
  - Email verification via activation link
  - Resend verification code
  - Forgot password
  - Reset password
  - Google login

- `onboarding`
  - Personality results persist through backend user profile updates
  - Interests load from backend
  - Selected interests persist to backend

- `home`
  - Dashboard groups, invitations, recommendations, and unread counts are backend-backed
  - Invitation accept/decline actions are backend-backed

- `explore`
  - Group discovery feed is backend-backed
  - Join/request actions are backend-backed

- `activity`
  - Group and direct chat data is backend-backed
  - Message history is backend-backed
  - Message sending is backend-backed
  - Attachment upload is backend-backed
  - Voice note sending and playback use real backend/media URLs
  - Link previews are backend-backed
  - Plan proposals load/create/vote/withdraw against backend endpoints

- `forge`
  - `AUTO` forge path is backend-backed
  - `MANUAL` forge path is backend-backed

- `notifications`
  - Notification list, unread count, mark-read, and mark-all-read are backend-backed

- `profile`
  - Current user and public profile reads are backend-backed

- `settings`
  - Profile/account edits are backend-backed
  - Avatar upload is backend-backed

- `app-shell`
  - Authenticated route protection is backend/session-aware
  - User menu and notification shell state use backend-backed user/session data

### N/A or Intentionally Local

- `landing`
  - Marketing page, no backend dependency

- `design-system`
  - Internal visual QA route, no backend dependency

- `onboarding` static assessment content
  - IPIP questions, personality copy, and suggestion metadata are intentionally local product content
  - This is not an integration gap because the persistence layer is already backend-backed

## Remaining Risks

- Google sign-in still depends on valid `VITE_GOOGLE_CLIENT_ID` on the frontend and matching Google auth configuration on the backend.
- Email verification and password reset depend on working mail delivery in the target environment, even though the local endpoints themselves passed.
- The report confirms API/runtime integration locally, not production deployment health.

## Recommended Runtime QA

1. Register a new email account and complete verification both ways:
   - OTP inside the sign-up flow
   - activation link from email
2. Test forgot-password end to end from email request to successful reset.
3. Test Google login with both a brand-new Google account and a returning one.
4. Forge one `AUTO` and one `MANUAL` activity and confirm the resulting group/chat/plan records appear in the app.
5. Send text, image/file, and voice messages in `activity`, then confirm link previews and attachments render after refresh.
