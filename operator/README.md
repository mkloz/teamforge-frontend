# Operator workspace

This entry builds separately from the TeamForge consumer app and is not part of
the consumer router or PWA.

Set `VITE_OPERATOR_API_URL` to the protected operator origin, including
`/api/v1`. The browser sends cookies to that origin. An identity-aware proxy is
responsible for validating the operator session and adding its signed assertion;
the browser code must never read or store that assertion.
