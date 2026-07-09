import { useState } from "react";
import ChatWindow from "./ChatWindow";
import PersonaSelector from "./PersonaSelector";
import LanguageSelector from "./LanguageSelector";
import SuggestionCards from "./SuggestionCards";
import { useCopilot } from "../hooks/useCopilot";
import { Persona, Language } from "../types";

export default function AICopilot() {
  const { messages, loading, sendMessage } = useCopilot();

  const [input, setInput] = useState("");
  const [persona, setPersona] = useState<Persona>("Fan");
  const [language, setLanguage] = useState<Language>("English");

  async function handleSend() {
    if (!input.trim()) return;

    await sendMessage(input);

    setInput("");
  }

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-sky-700 to-indigo-700 p-8">

        <h2 className="text-4xl font-bold text-white">
          🤖 StadiumVerse AI Copilot
        </h2>

        <p className="mt-2 text-slate-200">
          Your FIFA World Cup 2026 Intelligent Match Day Assistant
        </p>

      </div>

      {/* Persona + Language */}
      <div className="grid gap-6 md:grid-cols-2 p-6">

        <PersonaSelector
          value={persona}
          onChange={setPersona}
        />

        <LanguageSelector
          value={language}
          onChange={setLanguage}
        />

      </div>

      {/* Suggestions */}
      <div className="px-6">

        <SuggestionCards
          onSelect={(text) => setInput(text)}
        />

      </div>

      {/* Chat */}
      <div className="p-6">

        <ChatWindow
          messages={messages}
          loading={loading}
        />

      </div>

      {/* Input */}
      <div className="border-t border-slate-800 bg-slate-950 p-6">

        <div className="flex gap-3">

          <button
            className="rounded-xl bg-slate-800 px-4 text-xl hover:bg-slate-700"
            title="Voice Input"
          >
            🎤
          </button>

          <button
            className="rounded-xl bg-slate-800 px-4 text-xl hover:bg-slate-700"
            title="Upload Ticket"
          >
            🎫
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            placeholder="Ask anything about your match..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-sky-500"
          />

          <button
            onClick={handleSend}
            className="rounded-xl bg-sky-600 px-8 py-3 font-semibold text-white transition hover:bg-sky-500"
          >
            Send
          </button>

        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">

          <span>⚽ Match Context Aware</span>

          <span>🌍 Multilingual</span>

          <span>♿ Accessibility</span>

          <span>🚨 Emergency Ready</span>

          <span>📍 Stadium Navigation</span>

        </div>

      </div>

    </div>
  );
}