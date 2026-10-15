import PageHero from "@/components/sections/PageHero";
import FindCareSection from "@/components/sections/FindCareSection";
import { usePageTitle } from "@/hooks/usePageTitle";

const Care = () => {
  usePageTitle("Care near you", "Discover clinics, mental health services, and low-cost care options in your area.");

  return (
    <div className="bg-background">
      <PageHero badge="Find care" title="Care near you" subtitle="Clinics, mental health services, pharmacies, and low-cost care options." />
      <FindCareSection />
    </div>
  );
};

export default Care;
