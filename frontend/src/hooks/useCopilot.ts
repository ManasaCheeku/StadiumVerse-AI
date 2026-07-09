import { useState } from "react";
import { ChatMessage, Persona, Language } from "../types";

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
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
const response = await fetch("https://stadium-verse-ai-flame.vercel.app/ai/assist", {        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message,
          persona,
          language,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.answer ??
            data.summary ??
            JSON.stringify(data, null, 2),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "⚠ Unable to contact StadiumVerse AI.",
        },
      ]);
    }

    setLoading(false);
  }

  return {
    messages,
    loading,
    sendMessage,
  };
}