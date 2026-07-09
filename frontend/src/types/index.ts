export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export type Persona =
  | "Fan"
  | "Volunteer"
  | "Security"
  | "Operations"
  | "Organizer";

export type Language =
  | "English"
  | "Hindi"
  | "Kannada"
  | "Spanish"
  | "French";

export interface QuickAction {
  title: string;
  emoji: string;
  prompt: string;
}