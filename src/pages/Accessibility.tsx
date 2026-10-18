import { Check, Eye, Keyboard, Monitor, Volume2 } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";
import { SectionHeading, Surface } from "@/components/ui/primitives";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useT } from "@/i18n";

const features = [
  { id: "f1", icon: Keyboard },
  { id: "f2", icon: Eye },
  { id: "f3", icon: Volume2 },
  { id: "f4", icon: Monitor },
] as const;

const CHECKLIST = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"] as const;
const GAPS = ["gap1", "gap2"] as const;

const Accessibility = () => {
  const t = useT();
  usePageTitle(t("a11y.pageTitle"), t("a11y.pageDescription"));
  return (
    <div>
      <PageHero badge={t("a11y.badge")} title={t("a11y.title")} subtitle={t("a11y.subtitle")} />

      <Section first width="narrow" className="space-y-16">
        <Reveal>
          <SectionHeading eyebrow={t("a11y.approachEyebrow")} title={t("a11y.approachTitle")} lede={t("a11y.approachLede")} />
        </Reveal>

        <Reveal stagger className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Surface key={f.id} padding="md">
              <f.icon className="mb-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-lg text-foreground">{t(`a11y.${f.id}.title`)}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`a11y.${f.id}.desc`)}</p>
            </Surface>
          ))}
        </Reveal>

        <Reveal>
          <SectionHeading title={t("a11y.inPlace")} />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {CHECKLIST.map((id) => (
              <li key={id} className="flex items-start gap-3 rounded-md border border-border p-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <span className="text-sm text-foreground">{t(`a11y.${id}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <SectionHeading title={t("a11y.gaps")} />
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-muted-foreground">
            {GAPS.map((id) => (
              <li key={id} className="leading-relaxed">
                {t(`a11y.${id}`)}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <Surface padding="lg">
            <h2 className="text-2xl tracking-tight text-foreground">{t("a11y.barrierTitle")}</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t("a11y.barrierBody")}</p>
            <p className="mt-3 text-sm text-muted-foreground">{t("a11y.lastUpdated", { date: t("legal.date") })}</p>
          </Surface>
        </Reveal>
      </Section>
    </div>
  );
};

export default Accessibility;
