const reminders = [
  {
    time: "24 Hours Before",
    icon: "📅",
    message: "Check your ticket, travel plan and parking reservation.",
    color: "border-sky-500",
  },
  {
    time: "4 Hours Before",
    icon: "🚗",
    message: "Leave early to avoid traffic and parking congestion.",
    color: "border-orange-500",
  },
  {
    time: "2 Hours Before",
    icon: "🚪",
    message: "Gate E12 opens. Security screening starts.",
    color: "border-emerald-500",
  },
  {
    time: "30 Minutes Before",
    icon: "⚽",
    message: "Proceed to your seat before kickoff.",
    color: "border-red-500",
  },
];

export default function MatchReminder() {
  return (
    <section className="mt-12">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-4xl font-bold">
            🔔 Match Day Reminders
          </h2>

          <p className="text-slate-400 mt-2">
            AI keeps you prepared before every match.
          </p>

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {reminders.map((item) => (

          <div
            key={item.time}
            className={`rounded-3xl border ${item.color} bg-slate-900 p-6 hover:scale-105 transition`}
          >

            <div className="flex items-center gap-5">

              <div className="text-5xl">
                {item.icon}
              </div>

              <div>

                <h3 className="text-xl font-bold">
                  {item.time}
                </h3>

                <p className="text-slate-400 mt-2">
                  {item.message}
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}