import { useEffect, useState } from "react";

export default function MatchContextCard() {
  const matchDate = new Date("2026-07-19T19:30:00");

  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = matchDate.getTime() - now;

      if (diff <= 0) {
        setCountdown("Kickoff!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setCountdown(
        `${days}d ${hours}h ${mins}m ${secs}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="rounded-3xl bg-slate-900 p-8 shadow-xl border border-slate-800">

      <div className="flex justify-between items-center mb-6">

        <div>
          <p className="text-sky-400 font-semibold">
            FIFA WORLD CUP 2026
          </p>

          <h2 className="text-4xl font-bold mt-2">
            France 🇫🇷 vs Brazil 🇧🇷
          </h2>

          <p className="text-slate-400 mt-2">
            MetLife Stadium • New Jersey
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-400">
            Match Starts In
          </p>

          <h3 className="text-3xl font-bold text-emerald-400">
            {countdown}
          </h3>
        </div>

      </div>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="rounded-xl bg-slate-800 p-5">
          <p className="text-slate-400">Gate</p>
          <h3 className="text-2xl font-bold mt-2">E12</h3>
        </div>

        <div className="rounded-xl bg-slate-800 p-5">
          <p className="text-slate-400">Seat</p>
          <h3 className="text-2xl font-bold mt-2">B-203</h3>
        </div>

        <div className="rounded-xl bg-slate-800 p-5">
          <p className="text-slate-400">Weather</p>
          <h3 className="text-2xl font-bold mt-2">24°C ☀️</h3>
        </div>

        <div className="rounded-xl bg-slate-800 p-5">
          <p className="text-slate-400">Crowd</p>
          <h3 className="text-2xl font-bold mt-2 text-yellow-400">
            Moderate
          </h3>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">

        <div className="rounded-xl bg-emerald-900/30 border border-emerald-600 p-5">
          <h3 className="font-semibold text-emerald-400">
            Parking
          </h3>

          <p className="mt-2">
            620 spaces available
          </p>
        </div>

        <div className="rounded-xl bg-sky-900/30 border border-sky-600 p-5">
          <h3 className="font-semibold text-sky-400">
            Public Transport
          </h3>

          <p className="mt-2">
            Metro Line 2 • On Time
          </p>
        </div>

      </div>

    </section>
  );
}