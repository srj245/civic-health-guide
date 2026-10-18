import { Link, useLocation } from "react-router-dom";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useT } from "@/i18n";

const NotFound = () => {
  const location = useLocation();
  const t = useT();
  usePageTitle(t("notFound.title"), t("notFound.subtitle"));

  return (
    <div>
      <PageHero badge={t("notFound.badge")} title={t("notFound.title")} subtitle={t("notFound.subtitle")} />
      <Section first width="prose" className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("notFound.nothingAt")}{" "}
          <code className="rounded-md border border-border bg-card px-1.5 py-0.5 text-foreground">{location.pathname}</code>.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">{t("notFound.home")}</Link>
        </Button>
      </Section>
    </div>
  );
};

export default NotFound;
