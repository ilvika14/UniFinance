import React from "react";
import Herosection from "@/components/compo/herosection";
import Features from "@/components/compo/features";
import Testimonials from "@/components/compo/testimonials";
import UniFinanceFooter from "@/components/compo/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Herosection />
      <Features />
      <Testimonials />
      <UniFinanceFooter />
    </div>
  );
}
