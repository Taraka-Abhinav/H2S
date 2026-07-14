import { stadiumKnowledgeBase } from "@/data/stadiumKnowledge";
import {
  KNOWLEDGE_CATEGORIES,
  selectKnowledgeCategories,
  type KnowledgeCategory,
} from "@/lib/knowledgeCategories";

export { stadiumKnowledgeBase };
export type {
  Amenity,
  FAQ,
  Gate,
  KnowledgeProvenance,
  Section,
  StadiumKnowledgeBase,
  SustainabilityStation,
  TransportOption,
} from "@/data/stadiumKnowledge";

function gateContext(): string {
  return stadiumKnowledgeBase.gates
    .map(
      (gate) =>
        `- ${gate.name} (${gate.location}): sections ${gate.nearestSections.join(", ")}. Access: ${gate.accessibility}. ${gate.notes ?? ""}`
    )
    .join("\n");
}

function sectionContext(): string {
  return stadiumKnowledgeBase.sections
    .map(
      (section) =>
        `- ${section.name}: enter via ${section.gate}, ${section.level}, ${section.rowRange}. Nearby: ${section.nearestAmenities.join(", ")}`
    )
    .join("\n");
}

function amenityContext(): string {
  return stadiumKnowledgeBase.amenities
    .map(
      (amenity) =>
        `- ${amenity.name} [${amenity.type}]: ${amenity.location}. ${amenity.notes ?? ""}`
    )
    .join("\n");
}

function transportContext(): string {
  return stadiumKnowledgeBase.transport
    .map(
      (option) =>
        `- ${option.name} [${option.type}]: ${option.location}. ${option.schedule ? `Schedule: ${option.schedule}. ` : ""}${option.notes ?? ""}`
    )
    .join("\n");
}

function sustainabilityContext(): string {
  return stadiumKnowledgeBase.sustainability
    .map(
      (station) =>
        `- ${station.name} [${station.type}]: ${station.location}. ${station.accepts ? `Accepts: ${station.accepts.join(", ")}. ` : ""}${station.notes ?? ""}`
    )
    .join("\n");
}

function policyContext(): string {
  return stadiumKnowledgeBase.faqs
    .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
    .join("\n\n");
}

const CONTEXT_BUILDERS: Record<KnowledgeCategory, () => string> = {
  navigation: () => `GATES:\n${gateContext()}\n\nSECTIONS:\n${sectionContext()}`,
  amenities: () => `AMENITIES:\n${amenityContext()}`,
  transport: () => `TRANSPORT:\n${transportContext()}`,
  sustainability: () => `SUSTAINABILITY:\n${sustainabilityContext()}`,
  policies: () => `POLICIES AND FAQS:\n${policyContext()}`,
};

/** Selects a compact, reviewable subset while unknown questions retain full recall. */
export function stadiumKnowledgePrompt(question = ""): string {
  const matched = selectKnowledgeCategories(question);
  const categories = matched.length ? matched : KNOWLEDGE_CATEGORIES;
  const uniqueCategories = new Set<KnowledgeCategory>(
    categories.includes("navigation") || categories.includes("amenities")
      ? [...categories, "navigation", "amenities"]
      : categories
  );
  const context = [...uniqueCategories]
    .map((category) => CONTEXT_BUILDERS[category]())
    .join("\n\n");

  return `STADIUM: ${stadiumKnowledgeBase.stadiumName} — ${stadiumKnowledgeBase.event}\nPROVENANCE: ${stadiumKnowledgeBase.provenance.notice}\n\n${context}`;
}
