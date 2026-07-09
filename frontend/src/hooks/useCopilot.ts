import { useState } from "react";
import { ChatMessage, Persona, Language } from "../types";
import { askCopilot } from "../services/copilotService";

interface SendMessageOptions {
  message: string;
  persona: Persona;
  language: Language;
}

export function useCopilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "👋 Welcome to StadiumVerse AI. Ask me anything about your FIFA World Cup match.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  async function sendMessage({
    message,
    persona,
    language,
  }: SendMessageOptions) {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const data = await askCopilot({
        message,
        persona,
        language,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.answer ??
            data.summary ??
            "No response received.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "⚠ Unable to contact StadiumVerse AI. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return {
    messages,
    loading,
    sendMessage,
  };
}