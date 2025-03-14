
import { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import Team from "@/components/Team";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative">
      
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Benefits />
      <Team />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
