import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/" },
  { name: "My Match", path: "/match" },
  { name: "AI Copilot", path: "/copilot" },
  { name: "Navigation", path: "/navigation" },
  { name: "Emergency", path: "/emergency" },
  { name: "Profile", path: "/profile" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-2xl">
            ⚽
          </div>

          <div>

            <h1 className="text-2xl font-bold text-white">
              StadiumVerse AI
            </h1>

            <p className="text-sm text-slate-400">
              FIFA World Cup 2026 Match Day Copilot
            </p>

          </div>

        </div>

        {/* Navigation */}

        <nav className="hidden lg:flex items-center gap-8">

          {navItems.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `transition duration-200 ${
                  isActive
                    ? "text-sky-400 font-semibold"
                    : "text-slate-300 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>

          ))}

        </nav>

        {/* Right Side */}

        <div className="flex items-center gap-4">

          <button className="rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700">
            🌍 EN
          </button>

          <button className="rounded-xl bg-sky-600 px-5 py-2 font-semibold text-white hover:bg-sky-500">
            My Ticket
          </button>

        </div>

      </div>

    </header>
  );
}