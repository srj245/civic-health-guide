import PageHero from "@/components/sections/PageHero";
import NewsSection from "@/components/sections/NewsSection";
import { usePageTitle } from "@/hooks/usePageTitle";

const News = () => {
  usePageTitle("Health Legislation Updates", "Track real-time health-related bills from Congress, explained in plain English.");

  return (
    <div className="bg-background">
      <PageHero badge="Live from Congress.gov" title="Health bills" subtitle="Recent health-related bills from Congress, in plain English." />
      <NewsSection />
    </div>
  );
};

export default News;
