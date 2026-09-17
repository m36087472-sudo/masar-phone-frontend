"use client";
import ContactSection from "../components/ContactSection";
import AboutHero from "./components/AboutHero";
import AboutStats from "./components/AboutStats";
import AboutWhy from "./components/AboutWhy";
import AboutFeatures from "./components/AboutFeatures";
import AboutSections from "./components/AboutSections";
import AboutCTA from "./components/AboutCTA";

interface Props {
  whatsapp?: string;
  email?: string;
}

export default function AboutClient({ whatsapp, email }: Props) {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      dir="rtl"
      style={{ background: "#f8faff" }}
    >
      <AboutHero />
      <AboutStats />
      <AboutWhy />
      <AboutFeatures />
      <AboutSections />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-6">
        <ContactSection
          title="تواصل معنا"
          phone={whatsapp}
          whatsapp={whatsapp}
          email={email}
          fadeDelay={200}
        />
      </div>

      <AboutCTA />
    </main>
  );
}
