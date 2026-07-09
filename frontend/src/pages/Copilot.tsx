import Navbar from "../components/Navbar";
import AICopilot from "../components/AICopilot";
import Footer from "../components/Footer";

export default function Copilot() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Page Header */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="rounded-3xl bg-gradient-to-r from-sky-700 via-indigo-700 to-purple-700 p-10 shadow-2xl">
          <h1 className="text-5xl font-bold">
            🤖 StadiumVerse AI Copilot
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-slate-200">
            Your intelligent match-day assistant powered by AI. Get stadium
            navigation, ticket support, emergency guidance, parking assistance,
            multilingual help, and real-time match information.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm">
              ⚽ Match Context
            </span>

            <span className="rounded-full bg-white/20 px-4 py-2 text-sm">
              🌍 Multilingual
            </span>

            <span className="rounded-full bg-white/20 px-4 py-2 text-sm">
              🎫 Ticket Assistant
            </span>

            <span className="rounded-full bg-white/20 px-4 py-2 text-sm">
              📍 Navigation
            </span>

            <span className="rounded-full bg-white/20 px-4 py-2 text-sm">
              🚨 Emergency Ready
            </span>
          </div>
        </div>
      </section>

      {/* AI Chat */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <AICopilot />
      </section>

      <Footer />
    </main>
  );
}