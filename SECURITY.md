# Security and responsible use

FanPulse AI is a hackathon prototype for fan guidance and stadium decision support. It intentionally cannot operate gates, access controls, alarms, cameras, ticketing, transport systems, or emergency dispatch. All venue and crowd data in this repository is mock data.

## Security boundary

The browser communicates only with Next.js routes. Gemini credentials and provider configuration remain server-side.

Protected assets:

- the Google Generative AI API key;
- integrity of venue knowledge shown to fans;
- integrity of crowd readings and recommendations shown to staff; and
- availability and cost of AI-backed endpoints.

Untrusted inputs include chat messages, language choices, zone payloads, request headers, and model output.

## Implemented safeguards

### Secret handling

- `GOOGLE_GENERATIVE_AI_API_KEY` is read only by server code.
- The model configuration imports `server-only`, so accidental use from a Client Component fails at build time.
- No secret uses a `NEXT_PUBLIC_` prefix.
- `.env*.local` is ignored by Git.
- `.env.example` documents only the variable name, not a credential.
- The client never receives provider configuration or the API key.

### Input and output boundaries

- AI endpoints require JSON, verify same-origin browser requests, and reject invalid JSON or bodies above 32 KiB before model work.
- Empty chat requests are rejected before a model call; the last valid message must be from the user.
- Only user/assistant text parts are retained. Tool, file, metadata, and unknown parts are discarded.
- Chat context is limited to eight valid messages, 2,000 characters per message, and 8,000 characters total.
- Fan inputs are capped at 2,000 characters and staff inputs at 1,000 in the UI.
- Staff snapshots accept only two to eight unique zone IDs A–H, integer occupancy from 0–100, and known trend values. Server-owned names and capacities replace client claims before prompting.
- AI recommendations use a length-bounded structured-output schema and are grounded against deterministic, trend-aware assessments. Unsupported zones/gates are removed and priority is restored from trusted logic.
- Output tokens, retries, timeouts, and temperature are capped to control cost and reduce inconsistent responses.

### Abuse and browser protections

- A bounded in-memory limiter separates fan chat (12/minute/IP), staff chat (6/minute/IP), and insights (4/minute/IP), with `429`, `Retry-After`, and remaining-limit metadata.
- Fan and operations chat use separate public routes and rate scopes; users cannot select a staff role through the fan body.
- API responses include `Cache-Control: no-store`, `nosniff`, a request ID, and safe error shapes.
- Global headers set a restrictive Content Security Policy, deny framing, constrain referrers and browser permissions, isolate cross-origin resources, enable HSTS, and remove the framework-powered header.
- Provider logs contain a request ID and redacted, length-bounded error details rather than request bodies or raw credentials.
- Markdown rendering skips HTML and allowlists paragraphs, emphasis, lists, and code. Model-generated links and images are not rendered.

### Safety and hallucination controls

- Fan responses are grounded in a typed, reviewable stadium knowledge base.
- The prompt prohibits invented gates, amenities, times, readings, and policies.
- Missing facts are escalated to Guest Services instead of guessed.
- Emergency questions direct fans to a steward or emergency services.
- Staff prompts receive the current supplied snapshot and prohibit invented sensor data.
- Model insight prose must map back to the trusted deterministic assessments; only Gate C2 for Zone C is accepted as a gate claim.
- Recommendations require human control-room verification before operational action.
- Structured insight generation falls back to deterministic rules if the provider, parsing, or validation step fails.

### Privacy

The prototype has no database, user accounts, analytics integration, or server-side conversation history. It does not intentionally collect names, ticket identifiers, precise user locations, or other personal data. Prompts are sent to the configured AI provider, so real deployments must publish an appropriate privacy notice and provider data-processing terms.

## Known prototype limitations

The current demo does **not** include:

- authentication or authorization for `/staff`;
- distributed rate limiting, durable quotas, bot challenges, or per-identity abuse controls (the demo limiter is best-effort per running server instance);
- centralized audit logs, security monitoring, alerting, or trace correlation;
- a content management approval workflow for venue facts;
- signed or authenticated sensor events;
- prompt-injection classifiers or an allowlisted tool layer;
- a formal privacy retention policy; or
- high-availability provider failover for chat.

These boundaries are appropriate for a mock-data demonstration but must be addressed before any real venue trial.

## Production hardening priorities

1. Put staff routes behind identity-aware access with least-privilege roles.
2. Replace the per-instance demo limiter with a managed distributed limit and abuse detection by route, identity, and IP.
3. Enforce request-size limits at the edge as well as schema validation in the route.
4. Store venue knowledge in an approved, versioned source with review and rollback.
5. Ingest sensor data through authenticated, read-only adapters with freshness and provenance metadata.
6. Add recommendation IDs, source citations, timestamps, acknowledgement, and audit trails.
7. Add provider timeouts, circuit breaking, observability, redaction, and service-level alerts.
8. Conduct accessibility, multilingual, privacy, threat-model, and venue-safety reviews.
9. Keep physical operations behind authorized humans and approved control systems.

## Credential hygiene

Never commit a real key. Before every push, verify:

```bash
git status --short
git ls-files | grep -E '(^|/)\.env($|\.)' | grep -vE '\.env\.example$' || true
git grep -n 'GOOGLE_GENERATIVE_AI_API_KEY=' -- ':!*.example' || true
```

If a credential is ever committed, revoke it immediately in Google AI Studio, create a new key, remove the secret from Git history, and redeploy with the replacement.

## Reporting a vulnerability

Do not open a public issue containing secrets or exploit details. Use the repository owner's private contact channel or GitHub private vulnerability reporting if it is enabled. Include the affected route, reproduction steps, impact, and a minimal proof of concept without exposing real credentials or personal data.
