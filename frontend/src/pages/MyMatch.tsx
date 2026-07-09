import MainLayout from "../layouts/MainLayout";
import MatchContextCard from "../components/MatchContextCard";
import DigitalTicket from "../components/DigitalTicket";

export default function MyMatch() {
  return (
    <MainLayout>
      {/* Page Header */}

      <section className="mb-8">
        <h1 className="text-5xl font-bold">🎫 My Match</h1>

        <p className="mt-3 text-slate-400">
          Everything you need before entering the stadium.
        </p>
      </section>

      {/* Live Match Context */}

      <MatchContextCard />

      {/* Digital Ticket */}

      <section className="mt-10">
        <DigitalTicket />
      </section>

      {/* Match Information */}

      <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h2 className="text-3xl font-bold">📋 Match Information</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">🏟 Stadium</p>
            <h3 className="mt-2 text-xl font-bold">
              MetLife Stadium
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">🕢 Kickoff</p>
            <h3 className="mt-2 text-xl font-bold">
              7:30 PM
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">🚪 Gate</p>
            <h3 className="mt-2 text-xl font-bold">
              E12
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">💺 Seat</p>
            <h3 className="mt-2 text-xl font-bold">
              B203
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">🌤 Weather</p>
            <h3 className="mt-2 text-xl font-bold">
              24°C • Clear
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">🚇 Metro</p>
            <h3 className="mt-2 text-xl font-bold text-green-400">
              On Time
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">🚗 Parking</p>
            <h3 className="mt-2 text-xl font-bold text-sky-400">
              620 Slots
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">👥 Crowd Level</p>
            <h3 className="mt-2 text-xl font-bold text-yellow-400">
              Moderate
            </h3>
          </div>
        </div>
      </section>

      {/* AI Travel Advice */}

      <section className="mt-10 rounded-3xl border border-sky-700 bg-gradient-to-r from-sky-900/40 to-indigo-900/40 p-8">
        <h2 className="text-3xl font-bold text-sky-400">
          🤖 AI Match Day Recommendation
        </h2>

        <p className="mt-5 leading-8 text-slate-300">
          Based on current crowd density, weather conditions, parking
          availability and estimated queue times, StadiumVerse AI recommends
          arriving at <strong>Gate E12</strong> at least{" "}
          <strong>45 minutes before kickoff</strong>. Parking P2 currently has
          the shortest walking distance and moderate occupancy.
        </p>
      </section>
    </MainLayout>
  );
}