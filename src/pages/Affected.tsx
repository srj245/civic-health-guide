import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AffectedSection from "@/components/sections/AffectedSection";

const Affected = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <AffectedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Affected;
