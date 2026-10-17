import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/motion/Reveal";
import Section from "@/components/layout/Section";
import { IconTile, SectionHeading, Surface } from "@/components/ui/primitives";
import { Mail, Vote, Share2, ArrowRight, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ActionSection = () => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: "CivicCare",
      text: "Understand how government decisions affect your health. Plain English, real resources.",
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
      toast({ title: "Link copied", description: "Share it with friends and family." });
    }
  };

  return (
    <Section rule id="action" aria-labelledby="action-heading">
      <div>
        <Reveal>
          <SectionHeading id="action-heading" title="Take action" lede="Three things you can do in the next five minutes." />
        </Reveal>

        <Reveal stagger delay={120} className="mt-8 grid gap-4 md:grid-cols-3">
          <Surface as={Link} to="/representatives" variant="interactive" padding="md" className="group nudge">
            <IconTile icon={Mail} />
            <h3 className="mt-4 text-lg text-foreground">Message your representative</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Look up your reps, copy a ready-to-paste message, and send it through the contact form on their official site.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
              Find your rep
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
            <h3 className="mt-4 text-lg text-foreground">Check your voter registration</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm you are registered before the next election. Opens vote.org.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
              Check status
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </span>
          </Surface>

          <Surface as="button" type="button" onClick={handleShare} variant="interactive" padding="md" className="group nudge text-left">
            <IconTile icon={Share2} />
            <h3 className="mt-4 text-lg text-foreground">Share CivicCare</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Send it to someone who is trying to make sense of a health bill.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
              Copy link
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Surface>
        </Reveal>
      </div>
    </Section>
  );
};

export default ActionSection;
