import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FindCareSection from "@/components/sections/FindCareSection";

const Care = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <FindCareSection />
      </main>
      <Footer />
    </div>
  );
};

export default Care;
