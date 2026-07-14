# FanPulse AI

[![Quality Gate](https://github.com/Taraka-Abhinav/H2S/actions/workflows/ci.yml/badge.svg)](https://github.com/Taraka-Abhinav/H2S/actions/workflows/ci.yml)

> **Smarter stadiums, better games.** A grounded, multilingual fan assistant and a live decision-support copilot for FIFA World Cup 2026 stadium operations.

**Hack2Skill Virtual Prompt Wars — Challenge 4: Smart Stadiums & Tournament Operations**

FanPulse AI gives two matchday personas one shared source of operational truth:

- **Fans** get fast, language-aware answers about gates, seats, accessible routes, amenities, transport, policies, and sustainable choices.
- **Staff and volunteers** get an eight-zone operating picture, crowd trends, prioritized recommendations, and a copilot that reasons over the current snapshot.

The project is a working hackathon prototype. Stadium facts and crowd readings are deliberately marked mock data; the app is not an official FIFA or MetLife Stadium service.

## Why this problem matters

Large tournaments put tens of thousands of people, many languages, unfamiliar venue layouts, and time-critical operational decisions into the same space. Static signs and generic chatbots do not adapt to a fan's language, accessibility needs, or a changing crowd picture. Control-room teams also need recommendations that explain *where*, *why*, and *what action to consider*—not another unprioritized dashboard.

FanPulse AI connects those needs in one responsive platform. Its GenAI layer is grounded in curated venue data and live zone context, while deterministic validation and fallback rules keep the experience useful when the model is unavailable.

## Try the complete experience

| Route | Persona | What to demonstrate |
| --- | --- | --- |
| `/` | Everyone | Premium, responsive role selection and product overview |
| `/fan` | Fan | Streaming multilingual guidance grounded in stadium facts |
| `/staff` | Staff / volunteer | Live crowd simulation, zone map, chart, AI recommendations, and operational Q&A |

### Three-minute judge walkthrough

1. Open `/fan` and select **How do I get to Section 114?** The assistant should identify Gate C and provide grounded directions.
2. Switch the language to Spanish, French, Portuguese, or Arabic and ask another venue question.
3. Ask for an accessible restroom or step-free route to demonstrate inclusive navigation.
4. Open `/staff`. Point out Zone C above the 85% threshold, the trend indicator, and the eight-zone occupancy chart.
5. Select **Refresh AI insights**. The response is schema-validated, priority-sorted, and labeled as either a Gemini-enhanced brief or the deterministic safety engine.
6. Ask the operations copilot: **Which gate should relieve Zone C?** It receives the current zone snapshot, not stale hard-coded context.

## Challenge alignment

| Challenge expectation | FanPulse AI implementation |
| --- | --- |
| Smart, dynamic assistant | Streaming fan chat plus a separate staff copilot; the staff context changes with the simulated feed |
| Logical decision making | Explicit occupancy thresholds, trend-aware prioritization, named-zone actions, structured output, and a deterministic fallback |
| Navigation | Gate-to-section mapping and step-by-step stadium guidance |
| Crowd management | Eight zones, density states, trends, 15-second updates, alerts, charting, and overflow-gate recommendations |
| Accessibility | Step-free routes, accessible restrooms and parking, nursing and quiet rooms, hearing-loop information, semantic labels, live announcements, visible focus, and reduced-motion support |
| Transportation | Shuttle schedules, rail, parking, accessible parking, airport shuttle, and rideshare pickup guidance |
| Sustainability | Recycling hubs, water refill stations, EV charging, bike valet, and low-carbon rail/shuttle guidance |
| Multilingual assistance | Auto-detection plus manual override for English, Spanish, Portuguese, French, and Arabic |
| Operational intelligence | Gemini-generated structured briefs and free-form questions grounded in the current crowd snapshot |
| Real-time decision support | Occupancy jitter every 15 seconds; current readings are passed to both staff AI workflows |

## Evaluation evidence

| Evaluation area | Evidence in this repository |
| --- | --- |
| **Code Quality** | Strict TypeScript, typed domain models, small role-focused components, shared schemas, centralized AI configuration, linting, and documented architecture |
| **Security** | Server-only secret, 32 KiB body limit, Zod contracts, canonical sensor data, origin checks, scoped rate limits, security headers, sanitized errors, safe Markdown, and explicit threat model |
| **Efficiency** | Relevant-context retrieval, on-demand model calls, client-side sensor simulation, capped history/tokens, 45-second insight cache, compact JSON, and no database round trips |
| **Testing** | Vitest unit and route tests, Testing Library interaction tests, axe accessibility checks, enforced coverage thresholds, type checking, linting, and production build verification |
| **Accessibility** | Semantic controls, accessible names, keyboard paths, live/error announcements, non-color density labels, visible focus, responsive design, reduced motion, and inclusive venue content |
| **Problem Statement Alignment** | One Challenge 4 platform directly demonstrates navigation, crowd management, accessibility, transportation, sustainability, multilingual support, and live operational decisions |

## Product logic

### Fan assistant

The fan request is sent to `/api/chat` with the chosen language. The server selects relevant categories from the curated knowledge base in `lib/stadiumData.ts`, instructs the model not to invent locations or policies, and streams the answer back to the interface. Unknown queries safely receive the full knowledge base. Only eight sanitized text messages, 2,000 characters each and 8,000 characters total, can reach the model.

If a fact is not in the knowledge base, the assistant is instructed to say so and direct the fan to Guest Services. Emergency prompts prioritize the nearest steward or emergency services.

### Staff decision support

The dashboard starts from eight mock zones and applies small, bounded occupancy changes every 15 seconds. Density is calculated deterministically:

| Occupancy | State | Operational meaning |
| --- | --- | --- |
| Below 70% | Low | Normal flow; potential relief route |
| 70–85% | Moderate | Monitor, especially when trending upward |
| Above 85% | Critical | Prioritize intervention and verify with control room |

For operational recommendations, occupancy and trend first produce a deterministic risk score: `up` adds 8 points, `stable` adds 0, and `down` subtracts 6. Gemini rewrites those trusted assessments into concise cards; the server restores the deterministic priority, rejects duplicate/unknown zones and unsupported gate claims, then sorts the result high-to-low. If generation or grounding fails, the same deterministic assessment is returned with `source: "rules"`. The model can explain advice; it cannot operate gates or safety systems.

## GenAI implementation

- **Model routing:** Gemini 3.5 Flash handles multilingual fan/staff conversation; Gemini 3.1 Flash-Lite handles bounded structured operations briefs at lower latency and cost.
- **Grounding:** curated stadium knowledge for fans; the latest zone snapshot for staff.
- **Streaming:** fan and staff chat use streamed UI messages for fast perceived response.
- **Structured generation:** recommendations conform to a bounded Zod schema: `priority`, `zone`, `issue`, and `recommendation`.
- **Hallucination controls:** bounded context, deterministic safety baselines, explicit “do not invent” rules, named source data, and a Guest Services fallback.
- **Human-in-the-loop safety:** operational recommendations explicitly require control-room verification before closing gates or redirecting crowds.
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
- Staff snapshots accept only unique zone IDs A–H, integer occupancy, and a known trend. Names and capacities are restored from trusted server data, preventing prompt injection through sensor labels.
- Best-effort per-instance limits allow 12 fan chats, 6 staff chats, or 4 insight generations per IP per minute and return `429` with `Retry-After`.
- Model Markdown is restricted to safe text, emphasis, lists, and code—raw HTML, links, and images are not rendered.
- CSP, clickjacking, MIME-sniffing, referrer, permissions, cross-origin, and transport-security headers are configured globally.
- Generated recommendations are advisory and never execute physical actions.
- The prototype stores no chat history, personal data, location history, or sensor feed in a database.

For the threat model, current safeguards, and production hardening needs, read [SECURITY.md](SECURITY.md).

## Efficiency choices

- Static stadium knowledge stays in typed source data—no database round trip is needed for the demo—and only question-relevant categories are normally sent to Gemini.
- Crowd movement is simulated client-side; the 15-second refresh does not call an AI model and pauses while the tab is hidden.
- Gemini is invoked only when a user asks a question or explicitly refreshes insights.
- Chat keeps at most eight sanitized messages and caps output at 520 fan tokens or 420 staff tokens.
- Structured insights use the low-latency Gemini 3.1 Flash-Lite model, are capped at 900 output tokens, use minimal thinking, a 24-second provider deadline, and one retry.
- Equivalent insight snapshots (occupancy rounded to 5% buckets) reuse a bounded 45-second server cache.
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
  fan/page.tsx            # Fan experience
  staff/page.tsx          # Operations experience
components/
  ChatInterface.tsx       # Fan chat UI
  StaffDashboard.tsx      # Live dashboard orchestration
  StaffAskAI.tsx          # Current-snapshot operational Q&A
  ZoneMap.tsx             # Density and trend visualization
  OccupancyChart.tsx      # Responsive occupancy chart
lib/
  ai.ts                   # Server-only model configuration
  chatRoute.ts            # Shared secure streaming implementation
  stadiumData.ts          # Typed mock venue knowledge base
  crowdData.ts            # Typed mock zone data and simulation logic
  insights.ts             # Recommendation schema and priority sorting
  operations.ts           # Deterministic risk and recommendation engine
  validation.ts           # Message sanitization and canonical zone data
  requestSecurity.ts      # Body, origin, rate-limit, response, and log guards
  insightCache.ts         # Bounded short-lived snapshot cache
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
- “Real-time” in this prototype means a client-side update every 15 seconds.
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
