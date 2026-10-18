import PageHero from "@/components/sections/PageHero";
import FindCareSection from "@/components/sections/FindCareSection";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useT } from "@/i18n";

const Care = () => {
  const t = useT();
  usePageTitle(t("care.pageTitle"), t("care.pageDescription"));

  return (
    <div className="bg-background">
      <PageHero badge={t("care.badge")} title={t("care.pageTitle")} subtitle={t("care.subtitle")} />
      <FindCareSection />
    </div>
  );
};

export default Care;
