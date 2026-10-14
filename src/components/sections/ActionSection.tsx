import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
    <section id="action" className="border-t border-border bg-secondary/40 px-6 py-14 md:px-10 md:py-20" aria-labelledby="action-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="action-heading" className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Take action
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Three things you can do in the next five minutes.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            to="/representatives"
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-medium text-foreground">Message your representative</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Look up your reps, copy a ready-to-paste message, and send it through their contact page.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Find your rep
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>

          <a
            href="https://www.vote.org/am-i-registered-to-vote/"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Vote className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-medium text-foreground">Check your voter registration</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm you are registered before the next election. Opens vote.org.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Check status
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="group rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Share2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-medium text-foreground">Share CivicCare</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Send it to someone who is trying to make sense of a health bill.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Copy link
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </button>
        </div>

        <form
          onSubmit={handleSubscribe}
          className="mt-10 flex flex-col gap-3 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="block text-sm font-medium text-foreground">
              Get notified when new features launch
            </label>
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Saving…" : "Notify me"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ActionSection;
