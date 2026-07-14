import { describe, expect, it } from "vitest";
import { stadiumKnowledgeBase, stadiumKnowledgePrompt } from "@/lib/stadiumData";

describe("stadium knowledge base integrity", () => {
  it("maps every documented section to a real gate", () => {
    const gateNames = new Set(stadiumKnowledgeBase.gates.map(({ name }) => name));

    for (const section of stadiumKnowledgeBase.sections) {
      expect(gateNames.has(section.gate), `${section.name} references ${section.gate}`).toBe(true);
    }
  });

  it("contains a grounded accessible route and amenity", () => {
    expect(
      stadiumKnowledgeBase.gates.some(({ accessibility }) =>
        /wheelchair|step-free|level access|ramp/i.test(accessibility)
      )
    ).toBe(true);
    expect(
      stadiumKnowledgeBase.amenities.some(
        ({ accessible, type }) => accessible && type === "accessible_restroom"
      )
    ).toBe(true);
  });

  it("keeps all IDs unique within each data collection", () => {
    for (const collection of [
      stadiumKnowledgeBase.gates,
      stadiumKnowledgeBase.sections,
      stadiumKnowledgeBase.amenities,
      stadiumKnowledgeBase.transport,
      stadiumKnowledgeBase.sustainability,
    ]) {
      const ids = collection.map(({ id }) => id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("renders the facts needed for navigation, accessibility, transport, and sustainability", () => {
    const prompt = stadiumKnowledgePrompt();

    expect(prompt).toContain("STADIUM: MetLife Stadium");
    expect(prompt).toContain("Section 114: enter via Gate C");
    expect(prompt).toContain("Accessible Restroom W-2");
    expect(prompt).toContain("Downtown Shuttle (Green Line)");
    expect(prompt).toContain("Recycling Hub West");
    expect(prompt).toContain("Bag policy");
  });

  it.each([
    ["How do I reach Section 114?", ["GATES:", "SECTIONS:", "AMENITIES:"], ["TRANSPORT:", "SUSTAINABILITY:", "POLICIES AND FAQs:"]],
    ["Accessible restroom", ["GATES:", "SECTIONS:", "AMENITIES:"], ["TRANSPORT:", "SUSTAINABILITY:"]],
    ["When is the downtown shuttle?", ["TRANSPORT:"], ["GATES:", "SECTIONS:", "SUSTAINABILITY:"]],
    ["Recycle my bottle", ["SUSTAINABILITY:"], ["GATES:", "SECTIONS:", "TRANSPORT:"]],
    ["What is the bag policy?", ["POLICIES AND FAQS:"], ["GATES:", "TRANSPORT:", "SUSTAINABILITY:"]],
  ])("selects only relevant facts for: %s", (question, included, excluded) => {
    const prompt = stadiumKnowledgePrompt(question);
    for (const heading of included) expect(prompt).toContain(heading);
    for (const heading of excluded) expect(prompt).not.toContain(heading);
  });
});
