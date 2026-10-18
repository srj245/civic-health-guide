import { ExternalLink } from "lucide-react";
import { Eyebrow, Surface } from "@/components/ui/primitives";
import { useT } from "@/i18n";

/**
 * Statewide Minnesota programs that help before, or instead of, a clinic
 * search. CivicCare was built in Minnesota's Fourth District; these are the
 * numbers and sites people here are sent to first.
 */
const resources = [
  { id: "mnsure", href: "https://www.mnsure.org/" },
  { id: "ma", href: "https://mn.gov/dhs/people-we-serve/adults/health-care/health-care-programs/" },
  { id: "lifeline", href: "tel:988" },
  { id: "mdh", href: "https://www.health.state.mn.us/facilities/ruralhealth/safetynet/index.html" },
] as const;

const MinnesotaResources = () => {
  const t = useT();
  return (
    <section aria-labelledby="mn-heading">
      <Eyebrow className="mb-2">{t("care.mn.eyebrow")}</Eyebrow>
      <h3 id="mn-heading" className="text-lg text-foreground">
        {t("care.mn.heading")}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("care.mn.intro")}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2" data-stagger>
        {resources.map((r) => (
          <Surface key={r.id} as="li" padding="sm">
            <p className="text-foreground">{t(`care.mn.${r.id}.name`)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t(`care.mn.${r.id}.role`)}</p>
            <a
              href={r.href}
              target={r.href.startsWith("tel:") ? undefined : "_blank"}
              rel={r.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:text-foreground"
            >
              {t(`care.mn.${r.id}.cta`)}
              {!r.href.startsWith("tel:") && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
            </a>
          </Surface>
        ))}
      </ul>
    </section>
  );
};

export default MinnesotaResources;
