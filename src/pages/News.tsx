import NewsSection from "@/components/sections/NewsSection";

const News = () => {
  return (
    <div className="bg-background">
      <div className="px-6 py-8 md:px-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Health Legislation Updates</h1>
        <p className="text-muted-foreground mb-6">Track real-time health-related bills from Congress, in plain English.</p>
      </div>
      <NewsSection />
    </div>
  );
};

export default News;
