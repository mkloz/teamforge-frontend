# Phase 5 gateway and browser acceptance

This harness prepares the final browser/API cutover proof without changing a provider, server, database, frontend feature, or production deployment. It does not run against any target unless that exact origin appears in the command's allowlist.

## Safety model

- `public` is the default and only sends `GET` and `OPTIONS` requests plus an Engine.IO polling-to-WebSocket upgrade through an ephemeral loopback proxy.
- `authenticated`, `external-invite`, and `browser-authenticated` require their own explicit authorization flags. Credentials and disposable link tokens are accepted only from the current process environment, never from arguments or env files.
- The runner refuses remote targets unless `--authorize-remote-read-only` is present. Remote stateful lanes also require `--authorize-remote-stateful`, and every non-loopback authenticated, invite, or stateful origin must be HTTPS before credentials are read.
- Browser contexts are ephemeral. Tracing, screenshots, video, storage-state export, and credential files are not enabled. Any `trace.zip` found under the governed Phase 5 temp root is deleted before a retained summary is written.
- Every run requires the exact SHA-256 of the deploy directory. Browser modes additionally fetch and SHA-256 every publicly retrievable candidate file, compare the exact `index.html`, `manifest.webmanifest`, and `sw.js` bytes, and reject missing, mismatched, or extra published references. Deployment-only `_headers` remains bound by the deploy-tree digest rather than an impossible public-file fetch.
- A summary path must be under `temp/gateway-acceptance/` or `reports/findafew-implementation/phase-5/`, and an existing summary is never overwritten.

The loopback gateway exposes only `/findafew/api/v1` plus the two Engine.IO-equivalent exact forms `/findafew/socket.io` and `/findafew/socket.io/`. It translates those to the canary's internal `/api/v1`, `/socket.io`, and `/socket.io/` paths with query strings intact. Unprefixed, retired-prefix, doubled-slash, and unmatched paths return `404`; there are no compatibility aliases.

## Commands

Run the deterministic fixture suite first:

```powershell
npm run acceptance:gateway:self-test
```

Public loopback/canary contract, with no credentials or stateful request:

```powershell
npm run acceptance:gateway -- --mode public --upstream-origin http://127.0.0.1:6970 --allow-target http://127.0.0.1:6970 --deploy-dir dist --expected-build-sha256 <64-lowercase-hex>
```

This proves exact apex CORS and rejection, public health, unauthenticated `users/me`, public-prefix translation, seven fail-closed path families (including doubled and deeper socket paths), and Engine.IO polling-to-WebSocket upgrade through both accepted slash forms. The supplied upstream must already be an isolated canary; the harness does not start it.

The preflight requires `x-requested-with` alongside authorization, content type,
idempotency, and onboarding policy headers. This binds the GIS popup code
exchange to Google's documented `X-Requested-With: XmlHttpRequest` CSRF check.

## Google provider gates

- Google sign-in and account linking use the GIS authorization-code client with
  `ux_mode: "popup"`. They do not add a redirect URI, callback route, client-side
  state parameter, or client-side PKCE verifier. Both backend code exchanges
  send exactly `X-Requested-With: XmlHttpRequest` and remain unavailable until a
  verified client ID and exact browser origin are provisioned.
- Location suggestions use Places API (New):
  `AutocompleteSuggestion.fetchAutocompleteSuggestions`, one managed
  `AutocompleteSessionToken` per typing session, `PlacePrediction.toPlace()`,
  and `Place.fetchFields()` for only `id`, `displayName`, `formattedAddress`,
  `location`, and `addressComponents`. The custom combobox/listbox and Google
  attribution remain visible and keyboard accessible.
- With no Maps key, manual location text and browser geolocation still work.
  Browser coordinates remain private product data and are not reverse geocoded.
  Local group formation stays blocked, with a direct recovery action, until a
  complete coordinate pair exists; Online remains an honest alternative.
- Static Maps has an independent `VITE_GOOGLE_STATIC_MAPS_ENABLED` gate and is
  disabled by default. Places provisioning alone must not activate map images.

Authenticated gateway contract uses one explicit test session, refreshes it, tests authenticated realtime polling/upgrade/reconnect, then logs that session out:

```powershell
$phase5Credential = Get-Credential
$env:PHASE5_USER_EMAIL = $phase5Credential.UserName
$env:PHASE5_USER_PASSWORD = $phase5Credential.GetNetworkCredential().Password
try {
  npm run acceptance:gateway -- --mode authenticated --authorize-authenticated-session --upstream-origin http://127.0.0.1:6970 --allow-target http://127.0.0.1:6970 --deploy-dir dist --expected-build-sha256 <64-lowercase-hex>
} finally {
  Remove-Item Env:PHASE5_USER_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:PHASE5_USER_PASSWORD -ErrorAction SilentlyContinue
  $phase5Credential = $null
}
```

The external-invite cookie lane requires a disposable, approved token. It exchanges the token, checks the two host-only `Secure`, `HttpOnly`, `SameSite=Lax` cookies at `/findafew/api/v1/external-invites`, and proves that an in-memory cookie jar sends them to preview on the same public scope. It does not claim or suppress the invite.

```powershell
$phase5Invite = Read-Host "Disposable invite token" -AsSecureString
$phase5Pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($phase5Invite)
try {
  $env:PHASE5_EXTERNAL_INVITE_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($phase5Pointer)
  npm run acceptance:gateway -- --mode external-invite --authorize-invite-exchange --upstream-origin http://127.0.0.1:6970 --allow-target http://127.0.0.1:6970 --deploy-dir dist --expected-build-sha256 <64-lowercase-hex>
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($phase5Pointer)
  Remove-Item Env:PHASE5_EXTERNAL_INVITE_TOKEN -ErrorAction SilentlyContinue
  $phase5Invite = $null
}
```

Public-browser mode is intentionally restricted to the exact apex and API origins. It is appropriate only after an approved hosts/TLS canary mapping or controlled cutover makes those origins point to the reviewed candidate:

```powershell
npm run acceptance:gateway -- --mode browser-public --web-origin https://findafew.today --api-origin https://api.findafew.today --allow-target https://findafew.today --allow-target https://api.findafew.today --authorize-remote-read-only --deploy-dir dist --expected-build-sha256 <64-lowercase-hex>
```

Do not use browser mode merely because public DNS resolves. Confirm the target mapping, deployment digest, and authority window first.

## Authenticated 8/8 browser acceptance inputs

The `browser-authenticated` command refuses to run until all eight input families are explicit:

1. Frozen local deploy directory and exact SHA-256.
2. Web origin exactly `https://findafew.today`.
3. API origin exactly `https://api.findafew.today`.
4. Exact allowlist entries for both origins plus remote read-only and remote stateful authorization.
5. `PHASE5_USER_EMAIL` in process memory for a purpose-approved test user.
6. `PHASE5_USER_PASSWORD` in process memory for that user.
7. `--sample-group-id` for a group the user can access.
8. `--sample-user-id` for a profile the user may view.

The user must already satisfy current onboarding and producer schemas. The lane does not create, repair, seed, or migrate user data. It must pass exactly these eight product surfaces with no skip or placeholder substitution:

- `/home`
- `/explore`
- `/groups/{sample-group-id}`
- `/activity`
- `/profile`
- `/users/{sample-user-id}`
- `/settings`
- `/plans/new`

Use the same ephemeral credential pattern as the authenticated gateway command:

```powershell
$phase5Credential = Get-Credential
$env:PHASE5_USER_EMAIL = $phase5Credential.UserName
$env:PHASE5_USER_PASSWORD = $phase5Credential.GetNetworkCredential().Password
try {
  npm run acceptance:gateway -- --mode browser-authenticated --authorize-authenticated-session --authorize-remote-read-only --authorize-remote-stateful --web-origin https://findafew.today --api-origin https://api.findafew.today --allow-target https://findafew.today --allow-target https://api.findafew.today --sample-group-id <approved-id> --sample-user-id <approved-id> --deploy-dir dist --expected-build-sha256 <64-lowercase-hex>
} finally {
  Remove-Item Env:PHASE5_USER_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:PHASE5_USER_PASSWORD -ErrorAction SilentlyContinue
  $phase5Credential = $null
}
```

The lane signs in through the real UI, verifies the API request stayed on the exact public origin, checks the host-scoped refresh cookie, tests all 8 routes by accessible product signals, proves Socket.IO starts with polling then upgrades and reconnects, inspects PWA cache/local/session key names for retired identity, and always attempts bounded server-side logout plus local cookie clearing in a `finally`-equivalent cleanup path—even when login completion, a route, realtime, or a later assertion fails. Cleanup failure or timeout fails the lane without retaining an error message, response body, header, cookie, or token.

Route health is a browser/network contract, not merely a rendering check. Any relevant first-party failed request, same-origin resource response at `4xx`/`5xx`, or API response at `4xx`/`5xx` fails its route. The only documented public-lane exceptions are unauthenticated session discovery: `GET /findafew/api/v1/users/me -> 401` and `POST /findafew/api/v1/auth/refresh -> 401`. Authenticated routes have no such exception.

The API origin is itself a strict namespace. Every observed request or response must use `/findafew/api/v1` (or a descendant) or exactly `/findafew/socket.io` / `/findafew/socket.io/`. A response on `/wrong/path`, an unprefixed, retired, doubled-slash, or deeper socket path fails even when its status is `200`; `404` and `500` do not turn an unexpected path into an allowed probe.

## Required companion gates

This runner complements rather than replaces:

- `npm run pwa:release` for manifest, service worker, cache, offline and installability checks.
- `npm run test -- --run test/unit/shared/api/auth-realtime-browser-contract.test.ts test/unit/shared/api/realtime-client-contract.test.ts test/unit/shared/lib/realtime-event-registry.test.ts` for refresh, Socket.IO derivation and event-ID/entity-version dedupe.
- `npm run brand:certify` for compiled clean-slate residue certification.
- the Phase 5 server/provider ledger for canary isolation, Nginx/Cloudflare behavior, database disposition, and approved provider identities.

No command in this document is evidence that a live target passed. A run is acceptable only when its sanitized summary is retained with the exact deploy digest and all required checks report `passed`.
