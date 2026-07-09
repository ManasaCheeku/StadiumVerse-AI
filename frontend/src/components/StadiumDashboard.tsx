const stats = [
  {
    title: "Crowd Level",
    value: "Moderate",
    color: "text-yellow-400",
    icon: "👥",
  },
  {
    title: "Queue Time",
    value: "6 min",
    color: "text-green-400",
    icon: "⏱",
  },
  {
    title: "Parking",
    value: "620 Slots",
    color: "text-sky-400",
    icon: "🚗",
  },
  {
    title: "Weather",
    value: "24°C",
    color: "text-orange-400",
    icon: "☀️",
  },
  {
    title: "Security",
    value: "Normal",
    color: "text-emerald-400",
    icon: "🛡",
  },
  {
    title: "Transport",
    value: "On Time",
    color: "text-cyan-400",
    icon: "🚇",
  },
];

export default function StadiumDashboard() {
  return (
    <section className="mt-12">

      <h2 className="text-4xl font-bold mb-8">
        📊 Live Stadium Status
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-sky-500 transition"
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-400">
                  {item.title}
                </p>

                <h3 className={`mt-2 text-3xl font-bold ${item.color}`}>
                  {item.value}
                </h3>

              </div>

              <div className="text-5xl">
                {item.icon}
              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}