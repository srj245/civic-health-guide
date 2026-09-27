import { Heart, Target, Lightbulb, Code, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHero from "@/components/sections/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";

const About = () => {
  usePageTitle("About", "Learn about CivicCare's mission to make healthcare policy accessible to everyone.");
  return (
    <div className="bg-background animate-fade-in">
      <PageHero
        icon={Heart}
        badge="Our Mission"
        title="About CivicCare"
        subtitle="Bridging the gap between government health policy and the people it affects."
      />

      <section className="px-6 py-12 md:px-10">
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

          {/* Tech Stack */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Tech Stack</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Tailwind CSS", "Lovable Cloud", "Congress.gov API", "Google Maps Platform", "Lovable AI", "Vite"].map((tech) => (
                <span key={tech} className="px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground font-medium">
                  {tech}
                </span>
              ))}
            </div>
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
          <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              🏆 Congressional App Challenge
            </div>
            <h2 className="text-2xl font-bold text-foreground">Built for the Congressional App Challenge</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              CivicCare was designed and developed as a submission for the Congressional App Challenge. Our goal is to show how technology can make civic engagement in healthcare more accessible and understandable for every American.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
