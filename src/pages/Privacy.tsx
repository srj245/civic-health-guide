import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useT } from "@/i18n";

const SECTIONS = ["s1", "s2", "s3", "s4"] as const;

const Privacy = () => {
  const t = useT();
  usePageTitle(t("privacy.pageTitle"), t("privacy.pageDescription"));
  return (
    <div>
      <PageHero badge={t("legal.badge")} title={t("privacy.pageTitle")} subtitle={t("privacy.subtitle")} />
      <Section first width="prose" className="space-y-10">
        {SECTIONS.map((id) => (
          <div key={id}>
            <h2 className="text-2xl tracking-tight text-foreground">{t(`privacy.${id}.h`)}</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t(`privacy.${id}.p`)}</p>
          </div>
        ))}
        <p className="border-t border-border pt-4 text-sm text-muted-foreground">{t("legal.lastUpdated", { date: t("legal.date") })}</p>
      </Section>
    </div>
  );
};

export default Privacy;
