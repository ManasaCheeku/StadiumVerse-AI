const stats = [
  {
    title: "Crowd Level",
    value: "Moderate",
    icon: "👥",
    color: "text-yellow-400",
    progress: 68,
    status: "+8% from last hour",
  },
  {
    title: "Queue Time",
    value: "6 min",
    icon: "⏱️",
    color: "text-green-400",
    progress: 22,
    status: "Fast Entry",
  },
  {
    title: "Parking",
    value: "620 Slots",
    icon: "🚗",
    color: "text-sky-400",
    progress: 72,
    status: "Available",
  },
  {
    title: "Weather",
    value: "24°C",
    icon: "☀️",
    color: "text-orange-400",
    progress: 80,
    status: "Clear Sky",
  },
  {
    title: "Security",
    value: "Normal",
    icon: "🛡️",
    color: "text-emerald-400",
    progress: 100,
    status: "All Gates Secure",
  },
  {
    title: "Transport",
    value: "On Time",
    icon: "🚇",
    color: "text-cyan-400",
    progress: 95,
    status: "Metro Running",
  },
];

export default function StadiumDashboard() {
  return (
    <section
      aria-labelledby="stadium-dashboard"
      className="mt-12"
    >
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            id="stadium-dashboard"
            className="text-4xl font-bold text-white"
          >
            📊 Live Stadium Status
          </h2>

          <p className="mt-2 text-slate-400">
            Real-time operational overview for fans and stadium authorities.
          </p>
        </div>

        <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          🔴 Live
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-sky-500 hover:shadow-sky-900/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  {item.title}
                </p>

                <h3 className={`mt-2 text-3xl font-bold ${item.color}`}>
                  {item.value}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {item.status}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="text-5xl"
              >
                {item.icon}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs text-slate-400">
                <span>Status</span>
                <span>{item.progress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-700"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 text-right text-sm text-slate-500">
        Last Updated: Just now
      </div>
    </section>
  );
}