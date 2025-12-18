"use client";

import { Header, Hero, Features, Quotes, CTA, Footer } from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background/50 relative">
      {/* Fixed diffused circular gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px]" />
      </div>

      <Header />
      <Hero />
      <Features />
      <Quotes />
      <CTA />
      <Footer />
    </div>
  );
}
