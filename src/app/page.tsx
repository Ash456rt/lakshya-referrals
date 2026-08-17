import { Suspense } from "react";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import PayoutsMarquee from "@/components/site/PayoutsMarquee";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Stats from "@/components/site/Stats";
import HowItWorks from "@/components/site/HowItWorks";
import Calculator from "@/components/site/Calculator";
import Features from "@/components/site/Features";
import DashboardPreview from "@/components/site/DashboardPreview";
import Testimonials from "@/components/site/Testimonials";
import FAQ from "@/components/site/FAQ";
import CTA from "@/components/site/CTA";
import Footer from "@/components/site/Footer";
import ReferralTracker from "@/components/site/ReferralTracker";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  return (
    <>
      <ScrollProgress />
      <Navbar user={session} />
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
      <main>
        <Hero />
        <PayoutsMarquee />
        <Stats />
        <HowItWorks />
        <Calculator />
        <Features />
        <DashboardPreview />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
