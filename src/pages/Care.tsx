import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/sections/PageHero";
import FindCareSection from "@/components/sections/FindCareSection";
import { MapPin } from "lucide-react";

const Care = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <PageHero
          icon={MapPin}
          badge="Find Care Near You"
          title="Connect with Healthcare in Your Community"
          subtitle="Discover clinics, mental health services, and low-cost care options based on your location and needs."
        />
        <FindCareSection />
      </main>
      <Footer />
    </div>
  );
};

export default Care;
