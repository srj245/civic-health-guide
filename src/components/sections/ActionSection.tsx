import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import Section from "@/components/layout/Section";
import { IconTile, SectionHeading, Surface } from "@/components/ui/primitives";
import { Mail, Vote, Share2, ArrowRight, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";

const ActionSection = () => {
  const { toast } = useToast();
  const t = useT();

  const handleShare = async () => {
    const shareData = {
      title: t("brand"),
      text: t("action.shareText"),
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast({ title: t("action.copiedTitle"), description: t("action.copiedDesc") });
    }
  };

  return (
    <Section rule id="action" aria-labelledby="action-heading">
      <div>
        <Reveal>
          <SectionHeading id="action-heading" title={t("action.heading")} lede={t("action.lede")} />
        </Reveal>

        <Reveal stagger delay={120} className="mt-8 grid gap-4 md:grid-cols-3">
          <Surface as={Link} to="/representatives" variant="interactive" padding="md" className="group nudge">
            <IconTile icon={Mail} />
            <h3 className="mt-4 text-lg text-foreground">{t("action.messageTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("action.messageDesc")}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
              {t("action.messageCta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Surface>

          <Surface
            as="a"
            href="https://www.vote.org/am-i-registered-to-vote/"
            target="_blank"
            rel="noopener noreferrer"
            variant="interactive"
            padding="md"
            className="group nudge"
          >
            <IconTile icon={Vote} />
            <h3 className="mt-4 text-lg text-foreground">{t("action.voteTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("action.voteDesc")}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
              {t("action.voteCta")}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </span>
          </Surface>

          <Surface as="button" type="button" onClick={handleShare} variant="interactive" padding="md" className="group nudge text-left">
            <IconTile icon={Share2} />
            <h3 className="mt-4 text-lg text-foreground">{t("action.shareTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("action.shareDesc")}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
              {t("action.shareCta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Surface>
        </Reveal>
      </div>
    </Section>
  );
};

export default ActionSection;
