import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MatchReminder from "../components/MatchReminder";
import MatchContextCard from "../components/MatchContextCard";
import StadiumDashboard from "../components/StadiumDashboard";
import QuickActions from "../components/QuickActions";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <Hero />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <MatchReminder />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <MatchContextCard />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <StadiumDashboard />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <QuickActions />
      </section>

      <Footer />
    </main>
  );
}