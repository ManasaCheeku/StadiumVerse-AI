import { useState } from "react";
import { ChatMessage } from "../types";

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

  async function sendMessage(message: string) {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer ?? JSON.stringify(data),
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