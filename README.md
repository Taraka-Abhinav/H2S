# FanPulse AI

[![Quality Gate](https://github.com/Taraka-Abhinav/H2S/actions/workflows/ci.yml/badge.svg)](https://github.com/Taraka-Abhinav/H2S/actions/workflows/ci.yml)

> **Smarter stadiums, better games.** A grounded, multilingual fan assistant and a shared-context decision-support copilot for FIFA World Cup 2026 stadium operations.

**Hack2Skill Virtual Prompt Wars — Challenge 4: Smart Stadiums & Tournament Operations**

FanPulse AI gives two matchday personas one shared source of operational truth:

- **Fans** get fast, language-aware answers about gates, seats, accessible routes, amenities, transport, policies, and sustainable choices.
- **Staff and volunteers** get an eight-zone operating picture, crowd trends, prioritized recommendations, and a copilot that reasons over the current snapshot.

The project is a working hackathon prototype. Stadium facts and crowd readings are deliberately marked mock data; the app is not an official FIFA or MetLife Stadium service.

## Why this problem matters

Large tournaments put tens of thousands of people, many languages, unfamiliar venue layouts, and time-critical operational decisions into the same space. Static signs and generic chatbots do not adapt to a fan's language, accessibility needs, or a changing crowd picture. Control-room teams also need recommendations that explain *where*, *why*, and *what action to consider*—not another unprioritized dashboard.

FanPulse AI connects those needs in one responsive platform. Its GenAI layer is grounded in curated mock venue data and a timestamped simulated zone context, while deterministic validation and fallback rules keep the experience useful when the model is unavailable.

## Try the complete experience

| Route | Persona | What to demonstrate |
| --- | --- | --- |
| `/` | Everyone | Premium, responsive role selection and product overview |
| `/fan` | Fan | Streaming multilingual guidance that combines stadium facts, location/access preference, and an active advisory |
| `/staff` | Staff / volunteer | Shared simulated feed, zone map, chart, attributable AI brief, action acknowledgement, and operational Q&A |

### Three-minute judge walkthrough

1. Open `/fan`, choose **West Plaza** and **Step-free route**, then select **How do I get to Section 114?** The assistant receives both preferences plus the active Zone C advisory.
2. Confirm it does not claim Gate C2 is open without control-room authorization, then switch to Spanish, French, Portuguese, or Arabic.
3. Ask for an accessible restroom or lower-sensory route to demonstrate contextual inclusive navigation.
4. Open `/staff`. Point out Zone C above the 85% threshold, the trend indicator, and the eight-zone occupancy chart.
5. Select **Refresh AI brief**. The response is schema-validated, priority-sorted, stamped with source/snapshot/time, and labeled Gemini or deterministic.
6. Acknowledge and resolve one card, then wait for new telemetry: the original brief remains pinned and is marked stale rather than silently overwritten.
7. Ask the operations copilot: **Which gate should relieve Zone C?** It reads the same server snapshot and phase as the dashboard.

## Challenge alignment

| Challenge expectation | FanPulse AI implementation |
| --- | --- |
| Smart, dynamic assistant | Streaming fan chat plus a separate staff copilot; both use the same timestamped matchday adapter |
| Logical decision making | Phase-aware policy, explicit thresholds, trend-aware risk, contextual rerouting, named owner/recheck windows, grounded output, and deterministic fallback |
| Navigation | Gate-to-section mapping and step-by-step stadium guidance |
| Crowd management | Eight canonical zones, density/trend states, 15-second shared snapshots, active advisories, charting, and controlled overflow-gate recommendations |
| Accessibility | Step-free routes, accessible restrooms and parking, nursing and quiet rooms, hearing-loop information, semantic labels, live announcements, visible focus, and reduced-motion support |
| Transportation | Shuttle schedules, rail, parking, accessible parking, airport shuttle, and rideshare pickup guidance |
| Sustainability | Recycling hubs, water refill stations, EV charging, bike valet, and low-carbon rail/shuttle guidance |
| Multilingual assistance | Auto-detection plus manual override for English, Spanish, Portuguese, French, and Arabic |
| Operational intelligence | Gemini structured briefs and free-form Q&A grounded in the current phase, advisory, and exact snapshot |
| Real-time decision support | A replaceable `CrowdFeed` adapter emits shared timestamped snapshots; stale insight requests are rejected and existing briefs are visibly marked stale |

## Evaluation evidence

| Evaluation area | Evidence in this repository |
| --- | --- |
| **Code Quality** | Strict TypeScript with unchecked-index/optional-property checks, typed domain policy and adapters, thin routes/pages, role-focused components/hooks, shared runtime contracts, and documented boundaries |
| **Security** | Server-only secret, 32 KiB body limit, Zod contracts, canonical sensor data, origin checks, scoped rate limits, security headers, sanitized errors, safe Markdown, and explicit threat model |
| **Efficiency** | Relevant-context retrieval, on-demand model calls, deterministic server simulation, capped history/tokens, exact-snapshot cache, compact JSON, hidden-tab polling pause, and no database round trips |
| **Testing** | Vitest unit and route tests, Testing Library interaction tests, axe accessibility checks, enforced coverage thresholds, type checking, linting, and production build verification |
| **Accessibility** | Semantic controls, accessible names, keyboard paths, live/error announcements, non-color density labels, visible focus, responsive design, reduced motion, and inclusive venue content |
| **Problem Statement Alignment** | One Challenge 4 platform directly demonstrates navigation, crowd management, accessibility, transportation, sustainability, multilingual support, and live operational decisions |

## Product logic

### Fan assistant

The fan request is sent to `/api/chat` with validated location, access preference, and language enums. The server selects relevant categories from the typed knowledge base, adds the current match phase/advisory from `CrowdFeed`, and streams the answer. Active advisories override static routes. Unknown queries safely receive the full knowledge base. Only eight sanitized text messages, 2,000 characters each and 8,000 characters total, can reach the model.

If a fact is not in the knowledge base, the assistant is instructed to say so and direct the fan to Guest Services. Emergency prompts prioritize the nearest steward or emergency services.

### Staff decision support

`SimulatedCrowdFeed` generates one deterministic, timestamped eight-zone snapshot per 15-second bucket. `/api/telemetry`, fan chat, staff chat, and insights all read that adapter. Density is calculated deterministically:

| Occupancy | State | Operational meaning |
| --- | --- | --- |
| Below 70% | Low | Normal flow; potential relief route |
| 70–85% | Moderate | Monitor, especially when trending upward |
| Above 85% | Critical | Prioritize intervention and verify with control room |

For operational recommendations, occupancy, trend, and match phase first produce a deterministic baseline. Gemini rewrites those trusted assessments into concise cards; the server restores priority, owner, and recheck interval, rejects duplicate/unknown zones and unsupported gate claims, then sorts high-to-low. Each brief carries a source, snapshot ID, and generation time. A newer feed marks it stale without replacing it, and staff can acknowledge/resolve actions. If generation or grounding fails, the deterministic assessment is returned with `source: "rules"`. The model cannot operate gates or safety systems.

## GenAI implementation

- **Model routing:** Gemini 3.5 Flash handles multilingual fan guidance; Gemini 3.1 Flash-Lite handles staff Q&A and bounded structured operations briefs at lower latency and cost.
- **Grounding:** typed mock venue facts with provenance plus one shared matchday snapshot for both personas.
- **Streaming:** fan and staff chat use streamed UI messages for fast perceived response.
- **Structured generation:** recommendations conform to a bounded Zod schema covering priority, zone, issue, action, owner, and recheck interval.
- **Hallucination controls:** bounded context, deterministic safety baselines, explicit “do not invent” rules, named source data, and a Guest Services fallback.
- **Human-in-the-loop safety:** operational recommendations require control-room verification and expose acknowledgement/resolution state; Gate C2 is never automatic.
- **Resilience:** the insights route provides a deterministic safety fallback when Gemini is unavailable or its output fails grounding checks.
- **Separation of concerns:** fan chat (`/api/chat`) and staff chat (`/api/chat/staff`) have independent validation and rate-limit scopes.

See [Architecture](docs/ARCHITECTURE.md) for request flows, boundaries, and extension points.

## Accessibility and inclusive design

Accessibility is part of the workflow, not a separate marketing mode:

- stadium data includes step-free gates, wheelchair routes, accessible restrooms and parking, nursing rooms, quiet rooms, first aid, and assistive listening;
- controls have associated labels or accessible names, status content uses `aria-live`, and errors use alert semantics;
- a keyboard-visible skip link moves directly to the main content;
- keyboard users receive visible focus indicators and can operate chat, language, suggestion, and dashboard controls;
- density and risk are conveyed with text and icons in addition to color, and the native chart includes a screen-reader summary and data table;
- responsive layouts support phone-sized matchday use; and
- animation is disabled when the operating system requests reduced motion.

## Security, privacy, and responsible operation

- The Gemini key is protected by a server-only module and read through `GOOGLE_GENERATIVE_AI_API_KEY`; it is never prefixed with `NEXT_PUBLIC_` or sent to the browser.
- `.env*.local` is excluded from Git, and `.env.example` contains no secret.
- AI routes require JSON, enforce a 32 KiB raw-body limit, validate same-origin browser requests, and return non-cacheable responses.
- Chat content is reduced to sanitized text; tool/file/metadata parts are discarded, and the latest valid message must come from the user.
- Sensor snapshots are generated from canonical server data; client-provided labels/readings never enter AI prompts. Insight requests carry only a bounded snapshot ID and stale IDs receive HTTP 409.
- Best-effort per-instance limits allow 12 fan chats, 6 staff chats, or 4 insight generations per IP per minute and return `429` with `Retry-After`.
- Model Markdown is restricted to safe text, emphasis, lists, and code—raw HTML, links, and images are not rendered.
- CSP, clickjacking, MIME-sniffing, referrer, permissions, cross-origin, and transport-security headers are configured globally.
- Generated recommendations are advisory and never execute physical actions.
- The prototype stores no chat history, personal data, location history, or sensor feed in a database.

For the threat model, current safeguards, and production hardening needs, read [SECURITY.md](SECURITY.md).

## Efficiency choices

- Static stadium knowledge stays in typed source data—no database round trip is needed for the demo—and only question-relevant categories are normally sent to Gemini.
- Crowd movement is produced by a deterministic server-side adapter; 15-second polling does not call an AI model and pauses while the tab is hidden.
- Gemini is invoked only when a user asks a question or explicitly refreshes insights.
- Chat keeps at most eight sanitized messages and caps output at 520 fan tokens or 420 staff tokens.
- Structured insights use the low-latency Gemini 3.1 Flash-Lite model, are capped at 900 output tokens, use minimal thinking, a 24-second provider deadline, and one retry.
- Repeated requests for the exact same snapshot reuse a bounded 45-second server cache; prose is never reused across different percentages.
- The eight-bar occupancy view uses lightweight HTML/CSS with an accessible summary and table instead of shipping a charting runtime.
- Heavy fan and staff routes do not prefetch until the visitor chooses a persona.
- Shared API and UI components avoid duplicate logic, while schema validation prevents expensive malformed requests.

## Technology

- Next.js 15 App Router, React 18, and TypeScript
- Tailwind CSS and Lucide icons
- Vercel AI SDK with `@ai-sdk/google`
- Gemini 3.5 Flash + Gemini 3.1 Flash-Lite model routing
- Zod structured validation
- Responsive native HTML/CSS visualization with screen-reader table
- Vitest, Testing Library, axe-core, and GitHub Actions

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm
- A Google AI Studio API key

```bash
git clone https://github.com/Taraka-Abhinav/H2S.git
cd H2S
npm ci
cp .env.example .env.local
```

Add the key to `.env.local`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

Run the repository quality gates before a submission or deployment:

```bash
npm run test
npm run test:coverage
npm run typecheck
npm run lint
npm run build
```

Or execute the complete sequence with one command:

```bash
npm run validate
```

The detailed automated and manual verification matrix is in [TESTING.md](TESTING.md).

## Deploy to Vercel

1. Import this public GitHub repository into Vercel.
2. Keep the detected **Next.js** framework and default build settings.
3. Add `GOOGLE_GENERATIVE_AI_API_KEY` in **Project Settings → Environment Variables** for Production and Preview.
4. Deploy, then smoke-test `/`, `/fan`, and `/staff`.

No database or additional service configuration is required.

## Project structure

```text
app/
  api/chat/route.ts       # Streaming fan endpoint
  api/chat/staff/route.ts # Isolated streaming operations endpoint
  api/insights/route.ts   # Validated structured recommendations + fallback
  api/telemetry/route.ts  # Canonical simulated matchday snapshot
  fan/page.tsx            # Fan experience
  staff/page.tsx          # Operations experience
components/
  ChatInterface.tsx       # Fan chat orchestration
  chat/                   # Transcript presentation
  home/                   # Typed landing-page sections/content
  staff/                  # Dashboard header, metrics, action workflow
  StaffDashboard.tsx      # Thin operations composition
  StaffAskAI.tsx          # Shared-snapshot operational Q&A
  ZoneMap.tsx             # Density and trend visualization
  OccupancyChart.tsx      # Responsive occupancy chart
lib/
  ai.ts                   # Server-only model configuration
  chatPrompts.ts          # Context-aware fan/staff system prompts
  chatRoute.ts            # Secure streaming orchestration
  matchday.ts             # CrowdFeed contract + deterministic demo adapter
  operationsPolicy.ts     # One source for thresholds and recheck policy
  operations.ts           # Phase-aware deterministic decision engine
  insightGeneration.ts    # Model generation and semantic grounding
  insights.ts             # Shared request/response contracts
  validation.ts           # Message and fan-context sanitization
  requestSecurity.ts      # Stable HTTP/rate-limit facade
  insightCache.ts         # Exact-snapshot bounded cache
data/
  stadiumKnowledge.ts     # Typed mock facts and explicit provenance
hooks/
  useMatchdayTelemetry.ts # Abortable, hidden-tab-aware polling
  useOperationalBrief.ts  # Race-safe attributable brief lifecycle
docs/
  ARCHITECTURE.md         # System design and data flows
tests/
  api/                    # Route contracts, grounding, errors, and fallback
  components/             # Interaction and automated accessibility checks
  lib/                    # Domain logic and knowledge-base integrity
SECURITY.md               # Threat model and production considerations
TESTING.md                # Automated coverage and manual acceptance plan
```

## Assumptions and boundaries

- Venue and transport details are realistic mock data for demonstration, not live event guidance.
- Crowd values simulate a sensor feed and are not connected to cameras, Wi-Fi analytics, ticket scans, or physical access control.
- “Real-time” in this prototype means a shared simulated server snapshot refreshed every 15 seconds; it is not an approved venue sensor feed.
- The fan assistant serves general stadium guidance, not medical, legal, or emergency dispatch advice.
- Production staff access would require authentication, authorization, audit logs, distributed rate limiting, monitoring, and integration with approved venue systems.
- Gemini output is probabilistic; schemas, grounded prompts, safe fallbacks, and human verification reduce risk but do not replace trained staff.

## Submission compliance

At the latest local audit, the repository is public, uses only the `main` branch, and the tracked project files are well below the 10 MB challenge limit. Dependencies, builds, local environment files, coverage, and Vercel state are excluded through `.gitignore`.

Re-check these external settings immediately before submission:

```bash
# Exactly one remote branch should be listed
git ls-remote --heads origin

# Show Git object storage and tracked-file footprint
git count-objects -vH
git ls-files -z | xargs -0 du -ch | tail -1

# Confirm no local environment file is tracked (.env.example is intentional)
git ls-files | grep -E '(^|/)\.env($|\.)' | grep -vE '\.env\.example$' || true
```

Also open the repository in a signed-out browser window to confirm it remains public. Do not commit `.env.local` or any API key.
