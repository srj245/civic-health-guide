import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import { usePageTitle } from "@/hooks/usePageTitle";

const sections = [
  {
    h: "Data we collect",
    p: "CivicCare collects only the data needed to provide its services: your email address for authentication, any comments you post, and bills you choose to track. We do not sell or share your personal data with third parties.",
  },
  {
    h: "How we use your data",
    p: "Your data is used to personalize your experience, such as showing your tracked bills and comment history. A ZIP code entered for the district lookup is kept in your browser only. Locations entered in the care finder are not stored; they are used only for the duration of your search.",
  },
  {
    h: "Third-party services",
    p: "CivicCare uses the Congress.gov API (public government data), the U.S. Census geocoder and zippopotam.us (ZIP code to district), the Google Maps and Places APIs (care finder), and an AI service for bill summaries. These services receive only the minimum data needed to function.",
  },
  {
    h: "Your rights",
    p: "You can delete your own comments and untrack bills from within the app at any time. There is not yet a self-service account deletion button; to have your account and its data removed, contact the team through the project repository and we will delete it.",
  },
];

const Privacy = () => {
  usePageTitle("Privacy policy", "How CivicCare handles your data and protects your privacy.");
  return (
    <div>
      <PageHero badge="Legal" title="Privacy policy" subtitle="Your privacy matters. Here is how CivicCare handles your information." />
      <Section first width="prose" className="space-y-10">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-2xl tracking-tight text-foreground">{s.h}</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.p}</p>
          </div>
        ))}
        <p className="border-t border-border pt-4 text-sm text-muted-foreground">Last updated October 15, 2026</p>
      </Section>
    </div>
  );
};

export default Privacy;
