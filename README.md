# FanPulse AI

**Smarter stadiums, better games.** FanPulse AI is a GenAI-powered matchday platform for a FIFA World Cup 2026 hackathon demo.

It gives fans a multilingual stadium guide and gives operations teams a live crowd dashboard with AI-generated recommendations.

## What works

- `/` — responsive role-based landing page
- `/fan` — streaming stadium assistant in English, Spanish, Portuguese, French, and Arabic
- `/staff` — eight-zone live crowd simulation, occupancy chart, structured AI insights, and staff Q&A
- `/api/chat` — shared streaming Gemini endpoint for fan and staff experiences
- `/api/insights` — validated structured recommendations with a rule-based safety fallback

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local
```

Add your key to `.env.local`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

Then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy to Vercel

1. Import the repository in Vercel.
2. Add `GOOGLE_GENERATIVE_AI_API_KEY` under Project Settings → Environment Variables.
3. Deploy. No additional framework configuration is required.

The app uses `gemini-3.5-flash`, the Vercel AI SDK, Next.js App Router, TypeScript, Tailwind CSS, Recharts, and Lucide icons.

## Project structure

```text
app/
  api/chat/route.ts
  api/insights/route.ts
  fan/page.tsx
  staff/page.tsx
components/
  ChatInterface.tsx
  StaffDashboard.tsx
  ZoneMap.tsx
  OccupancyChart.tsx
lib/
  ai.ts
  stadiumData.ts
  crowdData.ts
  insights.ts
```

Stadium and crowd information in this project is mock data for demonstration purposes.
