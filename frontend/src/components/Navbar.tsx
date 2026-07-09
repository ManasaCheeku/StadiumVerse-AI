export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            🏆 StadiumVerse AI
          </h1>

          <p className="text-sm text-slate-400">
            FIFA World Cup 2026 Match Day Copilot
          </p>
        </div>

        <nav className="hidden md:flex gap-8 text-slate-300">
          <a href="#">Home</a>
          <a href="#">My Match</a>
          <a href="#">Navigation</a>
          <a href="#">AI Copilot</a>
          <a href="#">Emergency</a>
        </nav>
      </div>
    </header>
  );
}