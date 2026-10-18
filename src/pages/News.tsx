import PageHero from "@/components/sections/PageHero";
import NewsSection from "@/components/sections/NewsSection";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useT } from "@/i18n";

const News = () => {
  const t = useT();
  usePageTitle(t("bills.page.title"), t("bills.page.description"));

  return (
    <div className="bg-background">
      <PageHero badge={t("bills.page.badge")} title={t("bills.page.title")} subtitle={t("bills.page.subtitle")} />
      <NewsSection />
    </div>
  );
};

export default News;
