import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";

const links = [
  { name: "nav.bills", href: "/news" },
  { name: "footer.whoAffected", href: "/affected" },
  { name: "nav.care", href: "/care" },
  { name: "nav.reps", href: "/representatives" },
  { name: "nav.impact", href: "/impact" },
  { name: "nav.about", href: "/about" },
  { name: "footer.accessibility", href: "/accessibility" },
  { name: "footer.privacy", href: "/privacy" },
  { name: "footer.terms", href: "/terms" },
] as const;

const Footer = () => {
  const { t, machineTranslated } = useI18n();
  return (
    <footer className="mt-auto border-t border-border px-6 py-10 md:px-10" role="contentinfo">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} to={l.href} className="hover:text-foreground">
              {t(l.name)}
            </Link>
          ))}
        </nav>
        <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">{t("footer.sources")}</p>
        {machineTranslated && <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">{t("common.machineTranslated")}</p>}
        <p className="text-xs text-muted-foreground">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
};

export default Footer;
