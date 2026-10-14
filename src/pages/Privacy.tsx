import { Lock } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";

const Privacy = () => {
  usePageTitle("Privacy Policy", "How CivicCare handles your data and protects your privacy.");
  return (
    <div className="bg-background">
      <PageHero
        icon={Lock}
        badge="Legal"
        title="Privacy Policy"
        subtitle="Your privacy matters. Here's how CivicCare handles your information."
      />
      <section className="px-6 py-12 md:px-10">
        <div className="max-w-3xl mx-auto prose prose-sm text-foreground space-y-6">
          <h2 className="text-xl font-bold text-foreground">Data We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">CivicCare collects only the data needed to provide its services: your email address (for authentication), any comments you post, and bills you choose to track. We do not sell or share your personal data with third parties.</p>

          <h2 className="text-xl font-bold text-foreground">How We Use Your Data</h2>
          <p className="text-muted-foreground leading-relaxed">Your data is used to personalize your experience—such as showing your tracked bills and comment history. Location data entered in the Care Finder is not stored; it is used only for the duration of your search.</p>

          <h2 className="text-xl font-bold text-foreground">Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">CivicCare uses the Congress.gov API (public government data), Google Maps API (for care finding), and AI services for bill summaries. These services receive only the minimum data needed to function.</p>

          <h2 className="text-xl font-bold text-foreground">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">You can delete your own comments and untrack bills from within the app at any time. There is not yet a self-service account deletion button; to have your account and its data removed, contact the team through the project repository and we will delete it.</p>

          <p className="text-sm text-muted-foreground pt-4 border-t border-border">Last updated: October 14, 2026</p>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
