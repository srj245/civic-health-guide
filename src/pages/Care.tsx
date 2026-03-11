import FindCareSection from "@/components/sections/FindCareSection";
import { usePageTitle } from "@/hooks/usePageTitle";

const Care = () => {
  usePageTitle("Find Care Near You", "Discover clinics, mental health services, and low-cost care options in your area.");

  return (
    <div className="bg-background animate-fade-in">
      <div className="px-6 py-8 md:px-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Find Care Near You</h1>
        <p className="text-muted-foreground mb-6">Discover clinics, mental health services, and low-cost care options.</p>
      </div>
      <FindCareSection />
    </div>
  );
};

export default Care;
