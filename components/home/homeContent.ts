import {
  Accessibility,
  Activity,
  Bot,
  Languages,
  MapPinned,
  Radio,
  Waves,
  type LucideIcon,
} from "lucide-react";

export interface HomeMetric {
  value: string;
  label: string;
}

export interface HomeCapability {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface HomeProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface HomeFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const HOME_METRICS = [
  { value: "5", label: "fan languages" },
  { value: "8", label: "simulated zones" },
  { value: "15s", label: "crowd refresh" },
  { value: "2", label: "safety layers" },
] satisfies readonly HomeMetric[];

export const CHALLENGE_CAPABILITIES = [
  {
    icon: MapPinned,
    title: "Navigation",
    description: "Grounded section-to-gate directions with nearby venue services.",
  },
  {
    icon: Activity,
    title: "Crowd management",
    description: "Capacity, trend, and deterministic risk scoring across eight zones.",
  },
  {
    icon: Accessibility,
    title: "Accessibility",
    description: "Step-free routes, sensory spaces, hearing support, and accessible amenities.",
  },
  {
    icon: Radio,
    title: "Transportation",
    description: "Metro, shuttle, parking, airport, and rideshare matchday guidance.",
  },
  {
    icon: Waves,
    title: "Sustainability",
    description: "Water refill, recycling, compost, EV, and low-carbon travel choices.",
  },
  {
    icon: Bot,
    title: "Operational intelligence",
    description: "Gemini briefs grounded by a deterministic safety fallback.",
  },
] satisfies readonly HomeCapability[];

export const HOME_PROCESS_STEPS = [
  {
    step: "01",
    title: "Observe",
    description: "Normalize trusted zone IDs, occupancy, capacity, and movement trend.",
  },
  {
    step: "02",
    title: "Decide",
    description: "Rank risk deterministically and select a safe, auditable response.",
  },
  {
    step: "03",
    title: "Explain",
    description: "Use Gemini to turn grounded facts into clear multilingual guidance.",
  },
] satisfies readonly HomeProcessStep[];

export const HOME_FEATURES = [
  {
    icon: Languages,
    title: "Speak naturally",
    description: "Automatic language detection and manual override across five core fan languages.",
  },
  {
    icon: Accessibility,
    title: "Access without friction",
    description: "Step-free routes, accessible amenities, sensory spaces, and hearing-support information.",
  },
  {
    icon: Activity,
    title: "Operate with foresight",
    description: "Simulated demo occupancy signals become prioritized, specific recommendations for stadium teams.",
  },
] satisfies readonly HomeFeature[];
