import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/sections/PageHero";
import NewsSection from "@/components/sections/NewsSection";
import { TrendingUp } from "lucide-react";

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <PageHero
          icon={TrendingUp}
          badge="Live from Congress"
          title="Health Legislation Updates"
          subtitle="Track real-time health-related bills from Congress, translated into plain English so you can stay informed."
        />
        <NewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default News;
