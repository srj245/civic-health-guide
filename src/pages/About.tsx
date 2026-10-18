import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";
import { Eyebrow, SectionHeading, Surface } from "@/components/ui/primitives";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useT } from "@/i18n";

const FEATURES = ["f1", "f2", "f3", "f4"] as const;
const STACK = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;

const About = () => {
  const t = useT();
  usePageTitle(t("about.pageTitle"), t("about.pageDescription"));
  return (
    <div>
      <PageHero badge={t("about.badge")} title={t("about.title")} subtitle={t("about.subtitle")} />

      <Section first width="narrow" className="space-y-16">
        <Reveal>
          <SectionHeading title={t("about.problem")} />
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t("about.problemP1")}</p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t("about.problemP2")}</p>
        </Reveal>

        <Reveal>
          <SectionHeading title={t("about.whatItDoes")} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2" data-stagger>
            {FEATURES.map((id) => (
              <Surface key={id} padding="md">
                <h3 className="text-lg text-foreground">{t(`about.${id}.title`)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`about.${id}.desc`)}</p>
              </Surface>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <SectionHeading title={t("about.howBuilt")} />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2" data-stagger>
            {STACK.map((id) => (
              <Surface key={id} as="li" padding="sm">
                <p className="text-foreground">{t(`about.${id}.name`)}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t(`about.${id}.role`)}</p>
              </Surface>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">{t("about.aiNote")}</p>
        </Reveal>

        <Reveal>
          <Surface padding="lg">
            <Eyebrow>{t("about.cacEyebrow")}</Eyebrow>
            <h2 className="mt-2 text-2xl tracking-tight text-foreground">{t("about.cacTitle")}</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{t("about.cacBody")}</p>
          </Surface>
        </Reveal>
      </Section>
    </div>
  );
};

export default About;
