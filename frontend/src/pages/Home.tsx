import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MatchContextCard from "../components/MatchContextCard";
import QuickActions from "../components/QuickActions";
import Footer from "../components/Footer";
import StadiumDashboard from "../components/StadiumDashboard";
import MatchReminder from "../components/MatchReminder";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <Hero />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <MatchContextCard />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <QuickActions />
      </section>

      <Footer />
    </main>
  );
}