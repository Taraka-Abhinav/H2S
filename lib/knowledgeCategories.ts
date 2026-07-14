export const KNOWLEDGE_CATEGORIES = [
  "navigation",
  "amenities",
  "transport",
  "sustainability",
  "policies",
] as const;

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

const CATEGORY_TERMS: Record<KnowledgeCategory, readonly string[]> = {
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

export function selectKnowledgeCategories(question: string): KnowledgeCategory[] {
  const normalizedQuestion = question.toLocaleLowerCase();
  return KNOWLEDGE_CATEGORIES.filter((category) =>
    CATEGORY_TERMS[category].some((term) => normalizedQuestion.includes(term))
  );
}
