import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";
import { Eyebrow, SectionHeading, Surface } from "@/components/ui/primitives";
import { usePageTitle } from "@/hooks/usePageTitle";

const features = [
  { title: "Plain-English bill summaries", desc: "Short overviews of each bill generated from the official summary, always linked to the source text." },
  { title: "Live Congress data", desc: "Recent bills from the Congress.gov API, filtered for health policy and refreshed every ten minutes." },
  { title: "Your representatives", desc: "A ZIP code resolves to your district and the three people who vote on health bills for you." },
  { title: "Care near you", desc: "Clinics, mental health services, and pharmacies near a ZIP code or city, with distances." },
];

const stack = [
  { name: "React and TypeScript", role: "Single-page frontend built with Vite and Tailwind CSS" },
  { name: "Supabase", role: "Postgres with row-level security and realtime for comments and votes" },
  { name: "Deno edge functions", role: "Server-side proxies that keep API keys off the client and rate-limit requests" },
  { name: "Congress.gov API", role: "Live bill data, official summaries, and sponsor information" },
  { name: "Census geocoder and zippopotam.us", role: "ZIP code to congressional district, without an API key" },
  { name: "Google Places", role: "Clinic, pharmacy, and mental health provider search" },
  { name: "AI model", role: "Plain-English summaries and the help chat, constrained to data the server already fetched" },
];

const About = () => {
  usePageTitle("About", "Why CivicCare exists and how it is built.");
  return (
    <div>
      <PageHero badge="About" title="About CivicCare" subtitle="Bridging the gap between government health policy and the people it affects." />

      <Section first width="narrow" className="space-y-16">
        <Reveal>
          <SectionHeading title="The problem" />
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every year, hundreds of bills are introduced in Congress that affect access to health care, prescription drug costs, and
            mental health services. Most people never hear about them, and when they do, the language is dense enough that it is hard
            to tell what is actually changing.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            The communities most affected by health legislation are often the least informed about it. CivicCare was built to change that.
          </p>
        </Reveal>

        <Reveal>
          <SectionHeading title="What it does" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2" data-stagger>
            {features.map((item) => (
              <Surface key={item.title} padding="md">
                <h3 className="text-lg text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </Surface>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <SectionHeading title="How it is built" />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2" data-stagger>
            {stack.map((item) => (
              <Surface key={item.name} as="li" padding="sm">
                <p className="text-foreground">{item.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.role}</p>
              </Surface>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            AI coding tools were used during development. Which ones, and how, is disclosed in the project README.
          </p>
        </Reveal>

        <Reveal>
          <Surface padding="lg">
            <Eyebrow>Congressional App Challenge 2026</Eyebrow>
            <h2 className="mt-2 text-2xl tracking-tight text-foreground">Built for the Congressional App Challenge</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              CivicCare was designed and developed as a submission for the Congressional App Challenge, to show that civic
              information and the resources to act on it belong in the same place.
            </p>
          </Surface>
        </Reveal>
      </Section>
    </div>
  );
};

export default About;
