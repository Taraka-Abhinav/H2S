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
| Crowd and operations logic | Density boundaries, immutable simulation, occupancy clamping, trend changes, risk scoring, ranking, deterministic actions, metrics, and prompt serialization |
| Structured data | Insight length/schema bounds, priority sorting without mutation, relevant-context selection, knowledge integrity, valid gate references, and challenge categories |
| Validation/security helpers | Body/content-type limits, origin checks, scoped rate limits, text-only chat sanitization, context budgets, duplicate/unknown sensor rejection, and canonical server facts |
| Fan/staff chat API | Separate endpoints, request rejection, history limits, language instructions, relevant grounded fan prompts, canonical staff context, missing-key behavior, aborts, and sanitized provider failures |
| Staff insights API | Canonical sensor validation, deterministic baseline, structured grounding, unsupported gate rejection, priority restoration, cache behavior, timeout/provider fallback, and Gate C2 logic |
| Accessible UI | Associated labels, keyboard activation, disabled states, native button semantics, text alternatives to color, and automated axe scans |

`vitest.config.ts` enforces these minimums across selected safety-critical modules and components:

| Metric | Required |
| --- | ---: |
| Statements | 95% |
| Branches | 90% |
| Functions | 95% |
| Lines | 95% |

Latest verified result: **136/136 tests passed** across 11 files, with **99.39% statements, 95.77% branches, 100% functions, and 100% lines** in the safety-critical coverage scope.

The GitHub Actions workflow in `.github/workflows/ci.yml` runs `npm ci`, a high-severity production dependency audit, and `npm run validate` on every push and pull request targeting `main`. It has read-only repository permissions, a 15-minute timeout, and concurrency cancellation for superseded runs.

## Manual acceptance matrix

Run `npm run dev`, then verify these end-to-end scenarios:

| Area | Scenario | Expected result |
| --- | --- | --- |
| Routing | Open `/`, then use both persona calls to action | Fan and staff pages load; no `/chat` 404 |
| Fan grounding | Ask “How do I get to Section 114?” | Answer identifies Gate C and uses only known venue details |
| Accessibility guidance | Ask for the nearest accessible restroom or a wheelchair route to Gate C | Answer names the supported facility or step-free route |
| Multilingual | Select Spanish, Portuguese, French, or Arabic and ask a question | Answer uses the chosen language; Auto follows the latest fan message |
| Unknown fact | Ask about a gate or policy absent from the knowledge base | Assistant acknowledges the gap and directs the fan to Guest Services |
| Safety | Describe an active emergency | Assistant directs the fan to a steward or emergency services immediately |
| Streaming | Submit a fan question | Response appears progressively and the stop control is available while busy |
| Responsive UI | Test at 375 px and desktop width | No page-level horizontal overflow; controls remain usable |
| Keyboard | Tab through navigation, suggestions, language control, chat, and dashboard actions | Focus is visible and every interactive control can be activated |
| Reduced motion | Enable reduced motion in the OS/browser | Decorative animation and smooth scrolling are disabled |
| Live feed | Leave `/staff` open for at least 15 seconds | Zone values refresh within bounds and the timestamp changes |
| Density logic | Inspect zones below 70%, 70–85%, and above 85% | Labels, colors, text values, and chart threshold agree |
| AI insights | Select **Refresh AI insights** | Two to four sorted cards appear with issue and action fields |
| Insight provenance | Complete an insight request | UI labels the result “Gemini-enhanced brief” or “Deterministic safety engine” |
| Staff context | Ask “Which gate should relieve Zone C?” | Answer refers to current readings and supported Gate C2 context |
| Missing key | Start without `GOOGLE_GENERATIVE_AI_API_KEY`, then call chat | A controlled unavailable error appears; no key is requested client-side |
| Request security | Send invalid JSON, a non-JSON content type, or a body over 32 KiB | Route rejects it with HTTP 400, 415, or 413 before a model call |
| Rate limit | Exceed the documented route limit from one client | Route returns HTTP 429 and `Retry-After` instead of calling Gemini |
| Insight cache | Refresh an equivalent snapshot twice within 45 seconds | Second response is non-cacheable to the browser but reports server reuse with `cached: true` |

## API contract checks

The insights route can be exercised independently while the development server is running:

```bash
curl -sS -X POST http://localhost:3000/api/insights \
  -H 'Content-Type: application/json' \
  -d '{"zones":[{"id":"C","currentOccupancy":92,"trend":"up"},{"id":"D","currentOccupancy":81,"trend":"up"}]}'
```

Expected response contract:

```json
{
  "insights": [
    {
      "priority": "high",
      "zone": "Zone C",
      "issue": "...",
      "recommendation": "..."
    },
    {
      "priority": "high",
      "zone": "Zone D",
      "issue": "...",
      "recommendation": "..."
    }
  ],
  "source": "ai"
}
```

Names and capacities are intentionally absent from the request: the server restores them from its canonical A–H definition. The structured AI path produces two to four recommendations. If the provider, timeout, schema, or grounding check fails, the route returns deterministic recommendations with `"source": "rules"`; callers receive a useful response without mistaking it for model output.

Invalid payload check:

```bash
curl -i -X POST http://localhost:3000/api/insights \
  -H 'Content-Type: application/json' \
  -d '{"zones":[]}'
```

Expected: HTTP `400` with `{ "error": "A valid zones array is required." }`.

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
7. Test the deployed `/`, `/fan`, `/staff`, `/api/chat`, `/api/chat/staff`, and `/api/insights` paths—not only localhost.
