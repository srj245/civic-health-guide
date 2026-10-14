import { FileText } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";

const Terms = () => {
  usePageTitle("Terms of Service", "CivicCare terms of service and usage guidelines.");
  return (
    <div className="bg-background">
      <PageHero
        icon={FileText}
        badge="Legal"
        title="Terms of Service"
        subtitle="By using CivicCare, you agree to the following terms."
      />
      <section className="px-6 py-12 md:px-10">
        <div className="max-w-3xl mx-auto prose prose-sm text-foreground space-y-6">
          <h2 className="text-xl font-medium text-foreground">Use of Service</h2>
          <p className="text-muted-foreground leading-relaxed">CivicCare is a nonpartisan educational tool. You may use it to explore healthcare legislation, find care resources, and engage in community discussions. You agree not to use the platform for harassment, misinformation, or any unlawful purpose.</p>

          <h2 className="text-xl font-medium text-foreground">User Content</h2>
          <p className="text-muted-foreground leading-relaxed">Comments and discussions you post are visible to other authenticated users. You retain ownership of your content but grant CivicCare a license to display it within the platform. We reserve the right to remove content that violates community guidelines.</p>

          <h2 className="text-xl font-medium text-foreground">Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">CivicCare provides AI-generated bill summaries for educational purposes only. These summaries are not legal advice. Always refer to the official Congress.gov text for authoritative information.</p>

          <h2 className="text-xl font-medium text-foreground">Changes</h2>
          <p className="text-muted-foreground leading-relaxed">We may update these terms as the platform evolves. Continued use of CivicCare constitutes acceptance of any changes.</p>

          <p className="text-sm text-muted-foreground pt-4 border-t border-border">Last updated: October 14, 2026</p>
        </div>
      </section>
    </div>
  );
};

export default Terms;
