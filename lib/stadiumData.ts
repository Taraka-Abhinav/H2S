export interface Gate {
  id: string;
  name: string;
  location: string;
  nearestSections: string[];
  accessibility: string;
  notes?: string;
}

export interface Section {
  id: string;
  name: string;
  gate: string;
  level: string;
  rowRange: string;
  nearestAmenities: string[];
}

export interface Amenity {
  id: string;
  name: string;
  type: "restroom" | "accessible_restroom" | "nursing" | "quiet_room" | "first_aid" | "hearing_loop";
  location: string;
  accessible: boolean;
  notes?: string;
}

export interface TransportOption {
  id: string;
  name: string;
  type: "shuttle" | "parking" | "metro" | "rideshare";
  location: string;
  schedule?: string;
  notes?: string;
}

export interface SustainabilityStation {
  id: string;
  name: string;
  type: "recycling" | "water_refill" | "tip";
  location: string;
  accepts?: string[];
  notes?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface StadiumKnowledgeBase {
  stadiumName: string;
  event: string;
  gates: Gate[];
  sections: Section[];
  amenities: Amenity[];
  transport: TransportOption[];
  sustainability: SustainabilityStation[];
  faqs: FAQ[];
}

export const stadiumKnowledgeBase: StadiumKnowledgeBase = {
  stadiumName: "MetLife Stadium",
  event: "FIFA World Cup 2026",
  gates: [
    {
      id: "gate-a1",
      name: "Gate A1",
      location: "North entrance, Lot P1 side",
      nearestSections: ["101", "102", "103", "104"],
      accessibility: "Level access, elevator to Club Level, wheelchair seating assistance desk on concourse",
      notes: "Primary family entrance; bag check lanes 1–4",
    },
    {
      id: "gate-b2",
      name: "Gate B2",
      location: "East entrance, near Section 120",
      nearestSections: ["115", "116", "117", "118", "119", "120"],
      accessibility: "Ramp access from east parking; accessible restrooms 50m inside on left",
      notes: "High foot traffic during halftime — use Gate B3 overflow if lines exceed 15 min",
    },
    {
      id: "gate-c",
      name: "Gate C",
      location: "West concourse main entrance",
      nearestSections: ["110", "111", "112", "113", "114"],
      accessibility: "Wheelchair route via west plaza ramp; hearing loop at guest services",
      notes: "Closest gate to Section 114; follow green wayfinding signs",
    },
    {
      id: "gate-c2",
      name: "Gate C2 (Overflow)",
      location: "West concourse south extension",
      nearestSections: ["109", "110", "111", "114"],
      accessibility: "Step-free access; opens when Gate C exceeds 80% queue capacity",
      notes: "Overflow gate — opens automatically during peak ingress",
    },
  ],
  sections: [
    {
      id: "section-114",
      name: "Section 114",
      gate: "Gate C",
      level: "Lower Bowl — West",
      rowRange: "Rows 1–28",
      nearestAmenities: ["Accessible Restroom W-2", "Water Refill W-1", "Recycling Hub West"],
    },
    {
      id: "section-220",
      name: "Section 220",
      gate: "Gate B2",
      level: "Upper Bowl — East",
      rowRange: "Rows 1–32",
      nearestAmenities: ["Restroom E-4", "First Aid Station East", "Quiet Room E-1"],
    },
    {
      id: "section-101",
      name: "Section 101",
      gate: "Gate A1",
      level: "Lower Bowl — North",
      rowRange: "Rows 1–24",
      nearestAmenities: ["Nursing Room N-1", "Accessible Restroom N-1", "Recycling Hub North"],
    },
  ],
  amenities: [
    {
      id: "restroom-w2",
      name: "Accessible Restroom W-2",
      type: "accessible_restroom",
      location: "West concourse, between Sections 113 and 114",
      accessible: true,
      notes: "Family restroom adjacent; baby changing station inside",
    },
    {
      id: "nursing-n1",
      name: "Nursing Room N-1",
      type: "nursing",
      location: "North concourse, 30m past Gate A1",
      accessible: true,
      notes: "Private pods with seating and power outlets; no reservation needed",
    },
    {
      id: "quiet-e1",
      name: "Quiet Room E-1",
      type: "quiet_room",
      location: "East concourse, near Section 120",
      accessible: true,
      notes: "Sensory-friendly space; dim lighting, limited capacity 12 persons",
    },
    {
      id: "firstaid-east",
      name: "First Aid Station East",
      type: "first_aid",
      location: "East concourse, Gate B2 level",
      accessible: true,
      notes: "24/7 staffed during match; AED on site",
    },
    {
      id: "hearing-west",
      name: "Hearing Loop — Guest Services West",
      type: "hearing_loop",
      location: "West concourse guest services desk, Gate C",
      accessible: true,
      notes: "Assistive listening devices available for loan with ID deposit",
    },
  ],
  transport: [
    {
      id: "shuttle-downtown",
      name: "Downtown Shuttle (Green Line)",
      type: "shuttle",
      location: "Lot P2 shuttle plaza, Gate A side",
      schedule: "Every 10 min pre-match; every 5 min post-match until 23:30",
      notes: "Free for match ticket holders; show ticket or Fan ID",
    },
    {
      id: "shuttle-airport",
      name: "Airport Express Shuttle",
      type: "shuttle",
      location: "Lot P3 north pickup zone",
      schedule: "Every 20 min; last departure 22:00 on match days",
      notes: "Paid service; book via FIFA Fan App or on-site kiosk",
    },
    {
      id: "parking-p1",
      name: "Parking Lot P1",
      type: "parking",
      location: "North lot, Gate A1",
      notes: "General admission; arrive 90+ min early. EV charging stations in rows 12–14",
    },
    {
      id: "parking-p2",
      name: "Parking Lot P2",
      type: "parking",
      location: "East lot, Gate B2",
      notes: "Accessible parking rows A–D nearest to gate; pre-book recommended",
    },
    {
      id: "metro-meadowlands",
      name: "Meadowlands Rail Station",
      type: "metro",
      location: "800m walk via covered walkway to Gate B2",
      schedule: "Trains every 15 min match days; extended service until 01:00",
      notes: "Low-carbon option; follow blue pedestrian signs from station",
    },
    {
      id: "rideshare-west",
      name: "Rideshare Pickup — West Plaza",
      type: "rideshare",
      location: "West plaza, Zone H exit path",
      notes: "Designated Uber/Lyft zone; follow staff directions post-match",
    },
  ],
  sustainability: [
    {
      id: "recycle-west",
      name: "Recycling Hub West",
      type: "recycling",
      location: "West concourse, Section 113–114 midpoint",
      accepts: ["Plastic bottles", "Aluminum cans", "Paper cups (rinse first)"],
      notes: "Compost bins for food waste at adjacent station",
    },
    {
      id: "recycle-north",
      name: "Recycling Hub North",
      type: "recycling",
      location: "North concourse, Gate A1 interior",
      accepts: ["Plastic", "Metal", "Cardboard"],
    },
    {
      id: "water-w1",
      name: "Water Refill W-1",
      type: "water_refill",
      location: "West concourse, 20m from Gate C",
      notes: "Bring empty bottle — max 1L fill per visit; free filtered water",
    },
    {
      id: "tip-lowcarbon",
      name: "Low-Carbon Transport Tip",
      type: "tip",
      location: "N/A — general guidance",
      notes: "Metro + shuttle combo cuts match-day carbon ~40% vs solo driving. Bike valet at Lot P2 east entrance.",
    },
  ],
  faqs: [
    {
      question: "Bag policy",
      answer:
        "Bags must be clear plastic, vinyl, or PVC, max 12\" x 6\" x 12\", or a small clutch (4.5\" x 6.5\"). No backpacks or large purses. Medical bags exempt with inspection.",
    },
    {
      question: "Re-entry policy",
      answer:
        "No re-entry once you scan out. Keep your ticket accessible. Exception: medical emergencies with staff escort.",
    },
    {
      question: "Food and beverages",
      answer:
        "Sealed water bottles (max 500ml), empty refillable bottles, and small snacks allowed. No alcohol brought in. Full concessions on all concourses.",
    },
    {
      question: "Restrooms",
      answer:
        "Restrooms on every concourse at ~80m intervals. Accessible restrooms marked with ISA symbol. Shortest wait typically upper bowl (Sections 220+).",
    },
  ],
};

type KnowledgeCategory =
  | "navigation"
  | "amenities"
  | "transport"
  | "sustainability"
  | "policies";

const CATEGORY_TERMS: Record<KnowledgeCategory, string[]> = {
  navigation: [
    "gate", "section", "seat", "row", "route", "way", "where", "find",
    "puerta", "sección", "asiento", "portão", "seção", "porte", "siège",
    "بوابة", "قسم", "مقعد",
  ],
  amenities: [
    "restroom", "toilet", "accessible", "wheelchair", "nursing", "quiet",
    "sensory", "hearing", "first aid", "bathroom", "baño", "accesible",
    "banheiro", "acessível", "toilettes", "حمام", "كرسي",
  ],
  transport: [
    "shuttle", "parking", "metro", "train", "rail", "rideshare", "airport",
    "downtown", "bus", "aparcamiento", "estacionamiento", "transporte",
    "estacionamento", "navette", "مواصلات", "موقف",
  ],
  sustainability: [
    "recycle", "recycling", "water", "refill", "carbon", "bottle", "compost",
    "sustainable", "reciclar", "agua", "reciclagem", "água", "recyclage",
    "eau", "إعادة", "مياه",
  ],
  policies: [
    "bag", "re-entry", "reentry", "food", "beverage", "policy", "allowed",
    "bolsa", "comida", "mochila", "sac", "nourriture", "حقيبة", "طعام",
  ],
};

function categoryMatches(question: string, category: KnowledgeCategory): boolean {
  return CATEGORY_TERMS[category].some((term) => question.includes(term));
}

/**
 * Selects only the venue facts relevant to the latest question. Unknown queries
 * intentionally fall back to the full knowledge base so recall is never traded
 * for token savings.
 */
export function stadiumKnowledgePrompt(question = ""): string {
  const kb = stadiumKnowledgeBase;
  const normalizedQuestion = question.toLocaleLowerCase();
  const matchedCategories = (Object.keys(CATEGORY_TERMS) as KnowledgeCategory[]).filter(
    (category) => categoryMatches(normalizedQuestion, category)
  );
  const includeAll = matchedCategories.length === 0;
  const include = (category: KnowledgeCategory) =>
    includeAll || matchedCategories.includes(category);

  return `
STADIUM: ${kb.stadiumName} — ${kb.event}

${include("navigation") || include("amenities") ? `GATES:\n${kb.gates.map((g) => `- ${g.name} (${g.location}): sections ${g.nearestSections.join(", ")}. Access: ${g.accessibility}. ${g.notes || ""}`).join("\n")}` : ""}

${include("navigation") ? `SECTIONS:\n${kb.sections.map((s) => `- ${s.name}: enter via ${s.gate}, ${s.level}, ${s.rowRange}. Nearby: ${s.nearestAmenities.join(", ")}`).join("\n")}` : ""}

${include("amenities") || include("navigation") ? `AMENITIES:\n${kb.amenities.map((a) => `- ${a.name} [${a.type}]: ${a.location}. ${a.notes || ""}`).join("\n")}` : ""}

${include("transport") ? `TRANSPORT:\n${kb.transport.map((t) => `- ${t.name} [${t.type}]: ${t.location}. ${t.schedule ? `Schedule: ${t.schedule}. ` : ""}${t.notes || ""}`).join("\n")}` : ""}

${include("sustainability") ? `SUSTAINABILITY:\n${kb.sustainability.map((s) => `- ${s.name} [${s.type}]: ${s.location}. ${s.accepts ? `Accepts: ${s.accepts.join(", ")}. ` : ""}${s.notes || ""}`).join("\n")}` : ""}

${include("policies") ? `POLICIES AND FAQs:\n${kb.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}` : ""}
`.trim();
}
