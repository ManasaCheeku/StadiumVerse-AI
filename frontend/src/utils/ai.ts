export interface AISection {
  title: string;
  content: string;
}

export interface ParsedAIResponse {
  summary: string;
  recommendedAction: string;
  reasoning: string;
  alternative: string;
  accessibility: string;
  safety: string;
  confidence: number;
}

export function parseAIResponse(text: string): ParsedAIResponse {
  return {
    summary: text,

    recommendedAction:
      "Follow the guidance provided by StadiumVerse AI.",

    reasoning:
      "Recommendation generated using match context, stadium operations, crowd conditions and user role.",

    alternative:
      "If conditions change, use an alternative gate or route suggested by the AI.",

    accessibility:
      "Accessible routes, elevators and ramps will always be prioritised when required.",

    safety:
      "Follow official FIFA announcements and stadium staff instructions during emergencies.",

    confidence: 92,
  };
}

export function detectIntent(message: string): string {
  const text = message.toLowerCase();

  if (
    text.includes("gate") ||
    text.includes("entry")
  )
    return "navigation";

  if (
    text.includes("food") ||
    text.includes("restaurant")
  )
    return "food";

  if (
    text.includes("washroom") ||
    text.includes("toilet")
  )
    return "washroom";

  if (
    text.includes("parking")
  )
    return "parking";

  if (
    text.includes("metro") ||
    text.includes("bus") ||
    text.includes("transport")
  )
    return "transport";

  if (
    text.includes("emergency") ||
    text.includes("fire") ||
    text.includes("medical")
  )
    return "emergency";

  if (
    text.includes("ticket") ||
    text.includes("seat")
  )
    return "ticket";

  return "general";
}

export function confidenceColor(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-yellow-500";
  return "bg-red-500";
}

export const quickPrompts = [
  "🧭 Find my gate",
  "🚻 Nearest washroom",
  "🍔 Best food near my seat",
  "♿ Accessible route",
  "🚨 Report an emergency",
  "🎫 Show my ticket",
  "🚗 Parking availability",
  "🚇 Public transport status",
  "🌍 Translate stadium announcement",
  "👶 Report a lost child",
];