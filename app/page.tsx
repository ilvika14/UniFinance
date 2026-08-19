import React from "react";
import Herosection from "@/components/compo/herosection";
import Features from "@/components/compo/features";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Herosection />
      <Features />
    </div>
  );
}
