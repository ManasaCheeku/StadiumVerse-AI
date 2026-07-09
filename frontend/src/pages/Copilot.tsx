import Navbar from "../components/Navbar";
import AICopilot from "../components/AICopilot";
import Footer from "../components/Footer";

export default function Copilot() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <AICopilot />
      </section>

      <Footer />
    </main>
  );
}