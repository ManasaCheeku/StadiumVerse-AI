import MainLayout from "../layouts/MainLayout";

const emergencyCards = [
  {
    title: "Medical Emergency",
    icon: "🚑",
    description: "Locate the nearest medical centre or request immediate assistance.",
    color: "border-red-500",
  },
  {
    title: "Fire Emergency",
    icon: "🔥",
    description: "View the nearest emergency exit and follow evacuation guidance.",
    color: "border-orange-500",
  },
  {
    title: "Security Incident",
    icon: "👮",
    description: "Report suspicious activity or request stadium security support.",
    color: "border-blue-500",
  },
  {
    title: "Lost Child",
    icon: "🧒",
    description: "Instantly notify volunteers and security to begin search procedures.",
    color: "border-emerald-500",
  },
  {
    title: "Accessibility Help",
    icon: "♿",
    description: "Request wheelchair assistance or accessible evacuation support.",
    color: "border-cyan-500",
  },
  {
    title: "Emergency Contact",
    icon: "📞",
    description: "Connect with the stadium emergency control room.",
    color: "border-yellow-500",
  },
];

export default function Emergency() {
  return (
    <MainLayout>

      <section className="mb-10">

        <h1 className="text-5xl font-bold">
          🚨 Emergency Response Centre
        </h1>

        <p className="mt-3 text-slate-400">
          AI-powered emergency assistance for FIFA World Cup 2026.
        </p>

      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {emergencyCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border ${card.color} bg-slate-900 p-6 shadow-lg transition hover:scale-105`}
          >
            <div className="text-5xl">
              {card.icon}
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              {card.title}
            </h2>

            <p className="mt-3 text-slate-400">
              {card.description}
            </p>

            <button
              className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500"
            >
              Request Assistance
            </button>
          </div>
        ))}

      </div>

      <section className="mt-10 rounded-2xl border border-red-600 bg-red-900/20 p-8">

        <h2 className="text-3xl font-bold text-red-400">
          🚨 AI Emergency Guidance
        </h2>

        <ul className="mt-6 space-y-3 text-slate-300">

          <li>✔ Follow instructions from stadium officials.</li>

          <li>✔ Proceed to the nearest emergency exit if instructed.</li>

          <li>✔ Keep emergency pathways clear.</li>

          <li>✔ Assist children, elderly visitors and persons with disabilities if safe to do so.</li>

          <li>✔ Monitor official stadium announcements for updates.</li>

        </ul>

      </section>

    </MainLayout>
  );
}