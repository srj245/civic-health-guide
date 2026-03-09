import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsSection from "@/components/sections/NewsSection";

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <NewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default News;
