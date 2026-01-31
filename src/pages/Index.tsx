import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import NewsSection from "@/components/sections/NewsSection";
import AffectedSection from "@/components/sections/AffectedSection";
import FindCareSection from "@/components/sections/FindCareSection";
import ActionSection from "@/components/sections/ActionSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <NewsSection />
        <AffectedSection />
        <FindCareSection />
        <ActionSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
