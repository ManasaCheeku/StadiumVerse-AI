export default function Hero() {
  return (
    <section className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="max-w-5xl px-8 text-center">

        <p className="text-green-400 font-semibold tracking-widest uppercase">
          FIFA WORLD CUP 2026
        </p>

        <h1 className="text-6xl font-bold mt-4">
          StadiumVerse AI
        </h1>

        <h2 className="text-3xl mt-4 text-slate-300">
          Your AI Match Day Copilot
        </h2>

        <p className="mt-8 text-xl text-slate-400">
          Navigate the stadium, discover services, receive multilingual
          assistance, and get real-time AI guidance throughout your FIFA World
          Cup journey.
        </p>

        <button className="mt-10 rounded-xl bg-green-500 px-8 py-4 text-lg font-semibold hover:bg-green-600">
          Ask StadiumVerse AI
        </button>

      </div>
    </section>
  );
}