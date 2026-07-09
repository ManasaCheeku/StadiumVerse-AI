import { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}