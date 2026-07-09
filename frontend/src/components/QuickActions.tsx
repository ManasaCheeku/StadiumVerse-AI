import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Find My Gate",
    subtitle: "AI Navigation",
    emoji: "🧭",
    color: "from-sky-500 to-blue-600",
    route: "/navigation",
  },
  {
    title: "Food & Drinks",
    subtitle: "Nearby Restaurants",
    emoji: "🍔",
    color: "from-orange-500 to-red-500",
    route: "/navigation",
  },
  {
    title: "Nearest Washroom",
    subtitle: "Locate Facilities",
    emoji: "🚻",
    color: "from-cyan-500 to-blue-500",
    route: "/navigation",
  },
  {
    title: "Accessible Route",
    subtitle: "Wheelchair Friendly",
    emoji: "♿",
    color: "from-emerald-500 to-green-600",
    route: "/navigation",
  },
  {
    title: "Emergency",
    subtitle: "Medical & Security",
    emoji: "🚨",
    color: "from-red-500 to-red-700",
    route: "/emergency",
  },
  {
    title: "AI Copilot",
    subtitle: "Ask StadiumVerse AI",
    emoji: "🤖",
    color: "from-purple-500 to-indigo-600",
    route: "/copilot",
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <section className="mt-12">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-4xl font-bold">
            Quick Actions
          </h2>

          <p className="text-slate-400 mt-2">
            One tap access to essential match-day services.
          </p>

        </div>

      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {actions.map((action) => (

          <button
            key={action.title}
            onClick={() => navigate(action.route)}
            className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-2 hover:border-sky-500 hover:shadow-2xl"
          >

            <div
              className={`h-2 bg-gradient-to-r ${action.color}`}
            />

            <div className="p-8">

              <div className="text-6xl transition-transform duration-300 group-hover:scale-110">
                {action.emoji}
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {action.title}
              </h3>

              <p className="mt-3 text-slate-400">
                {action.subtitle}
              </p>

              <div className="mt-8 flex items-center text-sky-400">

                Open

                <span className="ml-2 transition-transform group-hover:translate-x-2">
                  →
                </span>

              </div>

            </div>

          </button>

        ))}

      </div>

    </section>
  );
}