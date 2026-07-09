import MainLayout from "../layouts/MainLayout";
import MatchContextCard from "../components/MatchContextCard";

export default function MyMatch() {
  return (
    <MainLayout>

      <section className="mb-8">

        <h1 className="text-5xl font-bold">
          🎫 My Match
        </h1>

        <p className="mt-3 text-slate-400">
          Everything you need before entering the stadium.
        </p>

      </section>

      <MatchContextCard />

      <section className="mt-10 grid gap-6 md:grid-cols-2">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-bold">
            🎟 Digital Ticket
          </h2>

          <div className="mt-6 rounded-xl bg-white p-8 text-center text-black">

            <h3 className="text-2xl font-bold">
              FIFA WORLD CUP 2026
            </h3>

            <p className="mt-3">
              France 🇫🇷 vs Brazil 🇧🇷
            </p>

            <p>Gate E12</p>

            <p>Seat B203</p>

            <div className="mt-6 text-7xl">
              ████
            </div>

            <p className="mt-3">
              Demo QR Code
            </p>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-bold">
            📋 Match Information
          </h2>

          <ul className="mt-6 space-y-4">

            <li>🏟 Stadium : MetLife Stadium</li>

            <li>🕢 Kickoff : 7:30 PM</li>

            <li>🚪 Gate : E12</li>

            <li>💺 Seat : B203</li>

            <li>🌤 Weather : 24°C</li>

            <li>🚇 Metro : On Time</li>

            <li>🚗 Parking : 620 Slots Available</li>

          </ul>

        </div>

      </section>

    </MainLayout>
  );
}