import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/motion/Reveal";
import Section from "@/components/layout/Section";
import { Input } from "@/components/ui/input";
import { FieldLabel, IconTile, SectionHeading, Surface } from "@/components/ui/primitives";
import { Mail, Vote, Share2, ArrowRight, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ActionSection = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: value });
      if (error && error.code !== "23505") throw error;
      toast({
        title: error ? "You're already on the list" : "You're on the list",
        description: "We'll email you when CivicCare updates launch.",
      });
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
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
              Look up your reps, copy a ready-to-paste message, and send it through their contact page.
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

        <Reveal as="form"
          onSubmit={handleSubscribe}
          className="mt-10 flex flex-col gap-3 rounded-md border border-border bg-card p-5 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <FieldLabel htmlFor="newsletter-email">Get notified when new features launch</FieldLabel>
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Saving…" : "Notify me"}
          </Button>
        </Reveal>
      </div>
    </Section>
  );
};

export default ActionSection;
