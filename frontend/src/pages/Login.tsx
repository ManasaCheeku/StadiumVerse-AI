import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Shield } from "lucide-react";
import { login, me, setAuthToken } from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("fan@stadiumverse.ai");
  const [password, setPassword] = React.useState("password123");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const token = await login(email, password);

      localStorage.setItem("stadiumverse_token", token.access_token);

      setAuthToken(token.access_token);

      await me();

      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">

        <div className="flex flex-col items-center mb-8">

          <div className="h-16 w-16 rounded-full bg-sky-600 flex items-center justify-center">
            <Shield className="text-white" size={30} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            StadiumVerse AI
          </h1>

          <p className="text-slate-400 mt-2 text-center">
            Sign in to access Smart Stadium Operations
          </p>

        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>

            <label className="text-sm text-slate-300 mb-2 block">
              Email
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-10 pr-4 py-3 text-white focus:outline-none focus:border-sky-500"
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />

            </div>

          </div>

          <div>

            <label className="text-sm text-slate-300 mb-2 block">
              Password
            </label>

            <div className="relative">

              <Lock
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-10 pr-4 py-3 text-white focus:outline-none focus:border-sky-500"
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />

            </div>

          </div>

          {error && (
            <div className="rounded-xl bg-red-900/40 border border-red-500 text-red-300 p-3 text-sm">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 transition py-3 text-white font-semibold"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <div className="mt-8 text-sm text-slate-400">

          <p className="font-semibold mb-2">
            Demo Accounts
          </p>

          <div className="space-y-1">

            <p>Fan → fan@stadiumverse.ai</p>
            <p>Volunteer → volunteer@stadiumverse.ai</p>
            <p>Security → security@stadiumverse.ai</p>
            <p>Manager → manager@stadiumverse.ai</p>
            <p>Admin → admin@stadiumverse.ai</p>

            <p className="mt-3">
              Password: <strong>password123</strong>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}