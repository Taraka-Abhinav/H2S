# Testing strategy

FanPulse AI separates deterministic domain logic from probabilistic AI output. Verification covers domain rules, request contracts, fallback behavior, accessible components, complete user journeys, and the production build. Tests mock the SDK boundary, never call Gemini, and never require an API key.

## Commands

Install the exact locked dependencies first:

```bash
npm ci
```

Then use the appropriate check:

```bash
npm test                 # Run the deterministic suite once
npm run test:watch       # Re-run affected tests while developing
npm run test:coverage    # Run tests with enforced coverage thresholds
npm run typecheck        # Verify TypeScript contracts
npm run lint             # Run ESLint with zero warnings allowed
npm run build            # Create a production Next.js build
npm run validate         # Typecheck, lint, coverage, and build
```

The build must succeed without an API key because the key is read only when an AI route is invoked. Coverage artifacts are ignored by Git.

## Automated coverage

| Layer | What is verified |
| --- | --- |
| Matchday and operations logic | Shared policy boundaries, deterministic snapshot IDs/freshness, phase/advisory context, risk scoring, ranking, owners, recheck windows, metrics, and prompt serialization |
| Structured data | Insight and API schema bounds, exact-snapshot cache identity/time, priority sorting, multilingual category retrieval, mock provenance, reference integrity, and valid gate claims |
| Validation/security helpers | Body/type limits, origin checks, scoped rate limits, text-only sanitization, context budgets, fan enum defaults/rejection, server-owned telemetry, and safe errors |
| Fan/staff chat API | Separate endpoints, request rejection, history limits, language/location/access constraints, shared server context, active advisory grounding, missing-key behavior, aborts, and safe provider failures |
| Telemetry/insights APIs | Typed telemetry contract, stale-ID 409, deterministic baseline, structured/semantic grounding, owner/recheck restoration, exact cache behavior, provider fallback, and Gate C2 authorization |
| Accessible workflow UI | Labels, keyboard activation, disabled states, non-color density text, axe scans, and recommendation acknowledge → resolve → reopen transitions |

`vitest.config.ts` enforces these minimums across selected safety-critical modules and components:

| Metric | Required |
| --- | ---: |
| Statements | 98% |
| Branches | 92% |
| Functions | 98% |
| Lines | 98% |

Latest verified result: **147/147 tests passed** across 14 files, with **99.73% statements, 94.93% branches, 100% functions, and 99.71% lines** in the safety-critical coverage scope.

The GitHub Actions workflow in `.github/workflows/ci.yml` runs `npm ci`, a high-severity production dependency audit, and `npm run validate` on every push and pull request targeting `main`. It has read-only repository permissions, a 15-minute timeout, and concurrency cancellation for superseded runs.

## Manual acceptance matrix

Run `npm run dev`, then verify these end-to-end scenarios:

| Area | Scenario | Expected result |
| --- | --- | --- |
| Routing | Open `/`, then use both persona calls to action | Fan and staff pages load; no `/chat` 404 |
| Fan grounding | Select West Plaza + Step-free, then ask “How do I get to Section 114?” | Answer combines venue facts with the Zone C advisory and does not claim Gate C2 is already open |
| Accessibility guidance | Change between Standard, Step-free, and Lower-sensory before asking for a route | Answer respects the selected preference while remaining advisory-aware |
| Multilingual | Select Spanish, Portuguese, French, or Arabic and ask a question | Answer uses the chosen language; Auto follows the latest fan message |
| Unknown fact | Ask about a gate or policy absent from the knowledge base | Assistant acknowledges the gap and directs the fan to Guest Services |
| Safety | Describe an active emergency | Assistant directs the fan to a steward or emergency services immediately |
| Streaming | Submit a fan question | Response appears progressively and the stop control is available while busy |
| Responsive UI | Test at 375 px and desktop width | No page-level horizontal overflow; controls remain usable |
| Keyboard | Tab through navigation, suggestions, language control, chat, and dashboard actions | Focus is visible and every interactive control can be activated |
| Reduced motion | Enable reduced motion in the OS/browser | Decorative animation and smooth scrolling are disabled |
| Shared simulated feed | Open `/fan` and `/staff`; leave staff open for at least 15 seconds | Both label the feed simulated; bounded zone values and snapshot time update |
| Density logic | Inspect zones below 70%, 70–85%, and above 85% | Labels, colors, text values, and chart threshold agree |
| AI insights | Select **Refresh AI brief** | Two to four sorted cards include issue, action, owner, and recheck fields |
| Insight provenance | Complete an insight request, then wait for the next snapshot | Source/time stay visible; the old brief remains pinned and is marked stale |
| Human review | Acknowledge and resolve a recommendation, then reopen it | Status changes only through the explicit buttons; no physical action is implied |
| Staff context | Ask “Which gate should relieve Zone C?” | Answer refers to current readings and supported Gate C2 context |
| Missing key | Start without `GOOGLE_GENERATIVE_AI_API_KEY`, then call chat | A controlled unavailable error appears; no key is requested client-side |
| Request security | Send invalid JSON, a non-JSON content type, or a body over 32 KiB | Route rejects it with HTTP 400, 415, or 413 before a model call |
| Rate limit | Exceed the documented route limit from one client | Route returns HTTP 429 and `Retry-After` instead of calling Gemini |
| Insight cache | Refresh the same snapshot twice within 45 seconds | Second response is non-cacheable to the browser but reports exact-snapshot reuse with `cached: true` |

## API contract checks

Read the current canonical demo snapshot first:

```bash
curl -sS http://localhost:3000/api/telemetry
```

Copy its `snapshotId`, then exercise the insight route:

```bash
curl -sS -X POST http://localhost:3000/api/insights \
  -H 'Content-Type: application/json' \
  -d '{"snapshotId":"demo-ingress-REPLACE_WITH_CURRENT_ID"}'
```

Expected response contract:

```json
{
  "insights": [
    {
      "priority": "high",
      "zone": "Zone C",
      "issue": "...",
      "recommendation": "...",
      "owner": "control_room",
      "recheckMinutes": 2
    },
    {
      "priority": "high",
      "zone": "Zone D",
      "issue": "...",
      "recommendation": "...",
      "owner": "steward_lead",
      "recheckMinutes": 5
    }
  ],
  "source": "ai",
  "snapshotId": "demo-ingress-...",
  "generatedAt": "2026-...Z"
}
```

Sensor readings are intentionally absent from the request: the server reads its own `CrowdFeed`. The structured AI path produces two to four recommendations. If the provider, timeout, schema, or grounding check fails, the route returns deterministic recommendations with `"source": "rules"`; callers receive a useful response without mistaking it for model output.

Invalid payload check:

```bash
curl -i -X POST http://localhost:3000/api/insights \
  -H 'Content-Type: application/json' \
  -d '{"snapshotId":"stale-or-invalid"}'
```

Expected: HTTP `409` when the ID is well-formed but no longer current, or HTTP `400` when the required ID is absent/invalid.

## AI quality evaluation

Generated wording is probabilistic, so tests should assert stable properties instead of exact sentences:

- the answer stays within the supplied stadium or zone context;
- no gate, amenity, reading, time, or policy is invented;
- accessibility and emergency guidance is prioritized;
- staff responses lead with an action, identify the affected zone/gate, and remain concise;
- recommendations remain advisory and mention control-room verification where relevant; and
- structured recommendations satisfy the shared schema before reaching the UI.

## Pre-submission regression

1. Run `npm run validate` and confirm every stage passes.
2. Complete the three-minute walkthrough in the README.
3. Verify the deployed Production environment has `GOOGLE_GENERATIVE_AI_API_KEY`.
4. Open the GitHub repository signed out to confirm public access.
5. Confirm `git ls-remote --heads origin` lists only `main`.
6. Confirm the repository remains below 10 MB and no environment file or secret is tracked.
7. Test the deployed `/`, `/fan`, `/staff`, `/api/telemetry`, `/api/chat`, `/api/chat/staff`, and `/api/insights` paths—not only localhost.
