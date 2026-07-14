import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-white">StadiumVerse AI</span>
        <div className="flex gap-6 text-sm text-slate-300">
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-sky-400" : "")}>
            Fan
          </NavLink>
          <NavLink to="/security" className={({ isActive }) => (isActive ? "text-sky-400" : "")}>
            Security
          </NavLink>
          <NavLink to="/volunteer" className={({ isActive }) => (isActive ? "text-sky-400" : "")}>
            Volunteer
          </NavLink>
          <NavLink to="/operations" className={({ isActive }) => (isActive ? "text-sky-400" : "")}>
            Operations
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "text-sky-400" : "")}>
            Admin
          </NavLink>
          <NavLink to="/copilot" className={({ isActive }) => (isActive ? "text-sky-400" : "")}>
            Copilot
          </NavLink>
        </div>
      </div>
    </nav>
  );
}