const navItems = [
  { label: "Home", href: "#" },
  { label: "My Match", href: "#" },
  { label: "Navigation", href: "#" },
  { label: "AI Copilot", href: "#" },
  { label: "Emergency", href: "#" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a
          href="#"
          aria-label="StadiumVerse AI Home"
          className="transition duration-200 hover:opacity-90"
        >
          <h1 className="text-2xl font-bold tracking-wide text-white">
            🏆 StadiumVerse AI
          </h1>

          <p className="text-sm text-slate-400">
            FIFA World Cup 2026 Match Day Copilot
          </p>
        </a>

        {/* Desktop Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-3 md:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-emerald-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Live Badge */}
          <span className="hidden rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white md:inline-flex">
            🔴 LIVE
          </span>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open navigation menu"
            className="rounded-lg p-2 text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}