import { Heart, Target, Lightbulb, Code, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHero from "@/components/sections/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";

const About = () => {
  usePageTitle("About", "Learn about CivicCare's mission to make healthcare policy accessible to everyone.");
  return (
    <div className="bg-background">
      <PageHero
        icon={Heart}
        badge="Our Mission"
        title="About CivicCare"
        subtitle="Bridging the gap between government health policy and the people it affects."
      />

      <section className="px-6 py-14 md:px-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Problem Statement */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">The Problem</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Every year, hundreds of bills are introduced in Congress that directly affect Americans' access to healthcare, prescription drug costs, mental health services, and more. Yet most people never hear about them — and when they do, the language is so dense that it's nearly impossible to understand what's actually changing.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This disconnect between policy and people means that communities most affected by health legislation are often the least informed about it. CivicCare was built to change that.
            </p>
          </div>

          {/* Solution */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Our Solution</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              CivicCare translates complex health legislation into plain English using AI, connects users with their elected representatives, and helps them find local healthcare resources — all in one place.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {[
                { title: "AI Bill Summaries", desc: "Short plain-English overviews of bills, with a link to the official text to double-check" },
                { title: "Live Congress Data", desc: "Recent bills from the Congress.gov API, filtered for health policy" },
                { title: "Find Your Rep", desc: "Look up representatives by state and draft a message to them" },
                { title: "Care Finder", desc: "Search for clinics, mental health services, and pharmacies near a ZIP code or city (sign-in required)" },
              ].map((item) => (
                <Card key={item.title} className="border-border">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How it's built */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">How it's built</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "React + TypeScript", role: "Single-page frontend built with Vite and Tailwind CSS" },
                { name: "Supabase", role: "Postgres database with row-level security and realtime for comments and votes" },
                { name: "Deno edge functions", role: "Server-side proxies that keep API keys off the client and rate-limit requests" },
                { name: "Congress.gov API", role: "Live bill data, official summaries and sponsor information" },
                { name: "Google Places", role: "Clinic, pharmacy and mental health provider search for the Care Finder" },
                { name: "AI model for summaries", role: "Generates plain-English bill summaries and the chat assistant, always linked back to the official text" },
              ].map((item) => (
                <li key={item.name} className="rounded-lg border border-border bg-card p-4">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              AI coding tools were used during development; which ones and how is disclosed in the project README.
            </p>
          </div>

          {/* Impact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Impact</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              CivicCare empowers people to understand the policies that shape their health, take meaningful action by contacting their representatives, and find the care they need — regardless of their background or political knowledge. We believe informed citizens build healthier communities.
            </p>
          </div>

          {/* Congressional App Challenge */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">Congressional App Challenge 2026</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Built for the Congressional App Challenge</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              CivicCare was designed and developed as a submission for the Congressional App Challenge. Our goal is to show how technology can make civic engagement in healthcare more accessible and understandable for every American.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
