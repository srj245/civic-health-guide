import PageHero from "@/components/sections/PageHero";
import AffectedSection from "@/components/sections/AffectedSection";
import Section from "@/components/layout/Section";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useT } from "@/i18n";

const Affected = () => {
  const t = useT();
  usePageTitle(t("affected.pageTitle"), t("affected.pageDescription"));

  return (
    <div className="bg-background">
      <PageHero badge={t("affected.badge")} title={t("affected.pageTitle")} subtitle={t("affected.subtitle")} />
      <Section first id="affected">
        <AffectedSection />
      </Section>
    </div>
  );
};

export default Affected;
