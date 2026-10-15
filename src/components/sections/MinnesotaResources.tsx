import { ExternalLink } from "lucide-react";
import { Eyebrow, Surface } from "@/components/ui/primitives";

/**
 * Statewide Minnesota programs that help before, or instead of, a clinic
 * search. CivicCare was built in Minnesota's Fourth District; these are the
 * numbers and sites people here are sent to first.
 */
const resources = [
  {
    name: "MNsure",
    role: "Minnesota's health insurance marketplace. Compare plans, check for financial help, and enroll.",
    href: "https://www.mnsure.org/",
    cta: "mnsure.org",
  },
  {
    name: "Medical Assistance and MinnesotaCare",
    role: "Free or low-cost coverage through the Department of Human Services for people with limited income.",
    href: "https://mn.gov/dhs/people-we-serve/adults/health-care/health-care-programs/",
    cta: "mn.gov/dhs",
  },
  {
    name: "Minnesota 988 Lifeline",
    role: "Call or text 988 any time for a mental health or substance use crisis. Free and confidential.",
    href: "tel:988",
    cta: "Call or text 988",
  },
  {
    name: "Minnesota Department of Health clinics",
    role: "Community health centers and safety-net clinics that see patients regardless of insurance.",
    href: "https://www.health.state.mn.us/facilities/ruralhealth/safetynet/index.html",
    cta: "health.state.mn.us",
  },
];

const MinnesotaResources = () => (
  <section aria-labelledby="mn-heading">
    <Eyebrow className="mb-2">Statewide, free</Eyebrow>
    <h3 id="mn-heading" className="text-lg text-foreground">
      Minnesota resources
    </h3>
    <p className="mt-1 text-sm text-muted-foreground">
      CivicCare started in Minnesota&apos;s Fourth District. These are the state programs to know before you search for a clinic.
    </p>
    <ul className="mt-4 grid gap-3 sm:grid-cols-2" data-stagger>
      {resources.map((r) => (
        <Surface key={r.name} as="li" padding="sm">
          <p className="text-foreground">{r.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{r.role}</p>
          <a
            href={r.href}
            target={r.href.startsWith("tel:") ? undefined : "_blank"}
            rel={r.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:text-foreground"
          >
            {r.cta}
            {!r.href.startsWith("tel:") && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
          </a>
        </Surface>
      ))}
    </ul>
  </section>
);

export default MinnesotaResources;
