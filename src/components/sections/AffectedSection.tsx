import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Chip, IconTile, Surface } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap, Users, Briefcase, Heart, ArrowRight, ExternalLink } from "lucide-react";
import { useHealthBills, type Bill } from "@/hooks/useCongressApi";

const audienceGroups = [
  {
    id: "students",
    icon: GraduationCap,
    title: "Students and young adults",
    ageRange: "18-26",
    description: "Stay on parents' insurance until 26, access campus mental health services, and understand student loan impacts on healthcare choices.",
    keyTopics: ["Insurance coverage", "Mental health", "Preventive care", "Campus resources"],
    searchTerms: ["student", "young adult", "college", "university", "mental health", "education"],
  },
  {
    id: "families",
    icon: Users,
    title: "Families with children",
    ageRange: "All ages",
    description: "Navigate CHIP and Medicaid for kids, understand school vaccination requirements, and find affordable family coverage options.",
    keyTopics: ["Children's health insurance", "Vaccines", "Pediatric care", "Family plans"],
    searchTerms: ["children", "family", "pediatric", "chip", "vaccination", "maternal"],
  },
  {
    id: "workers",
    icon: Briefcase,
    title: "Workers and employees",
    ageRange: "26-64",
    description: "Understand employer benefits, COBRA coverage between jobs, marketplace options for self-employed, and workplace health policies.",
    keyTopics: ["Employer insurance", "COBRA", "Marketplace plans", "Workplace rights"],
    searchTerms: ["employer", "workplace", "worker", "cobra", "affordable care", "labor"],
  },
  {
    id: "seniors",
    icon: Heart,
    title: "Seniors and retirees",
    ageRange: "65+",
    description: "Navigate Medicare Parts A, B, C, and D, understand prescription drug coverage, and access senior-specific health programs.",
    keyTopics: ["Medicare", "Prescription drugs", "Long-term care", "Preventive services"],
    searchTerms: ["medicare", "senior", "elderly", "prescription drug", "nursing", "retirement"],
  },
];

type AudienceGroup = (typeof audienceGroups)[number];

/** "Students and young adults" → "students" */
const groupNoun = (group: AudienceGroup) => group.title.split(" ")[0].toLowerCase();

interface AudienceBillsModalProps {
  group: AudienceGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bills: Bill[];
  loading: boolean;
}

const AudienceBillsModal = ({ group, open, onOpenChange, bills, loading }: AudienceBillsModalProps) => {
  if (!group) return null;

  // Bills whose titles name this group. Whole-word so "senior" doesn't match "seniority".
  const escaped = group.searchTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(?:${escaped.join("|")})s?\\b`, "i");
  const named = bills.filter((bill) => pattern.test(bill.title));
  // Health bills rarely name an audience in the title, so fall back to the latest
  // health bills rather than show an empty dialog.
  const usingFallback = named.length < 3;
  const relevantBills = (usingFallback ? [...named, ...bills.filter((b) => !named.includes(b))] : named).slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <IconTile icon={group.icon} size="sm" />
            Bills affecting {groupNoun(group)}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {loading && (
            <div className="space-y-3" aria-busy="true">
              {[...Array(3)].map((_, i) => (
                <Surface key={i} variant="inset" padding="sm">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </Surface>
              ))}
            </div>
          )}

          {!loading && usingFallback && relevantBills.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Few current bills name {groupNoun(group)} in the title, so these are the latest health bills that still apply.
            </p>
          )}

          {!loading && relevantBills.length === 0 && (
            <EmptyState
              compact
              title="No matching bills right now"
              body="Open the bills page for the latest health legislation."
              action={
                <Button asChild variant="outline">
                  <Link to="/news" onClick={() => onOpenChange(false)}>Browse health bills</Link>
                </Button>
              }
            />
          )}

          {!loading && relevantBills.map((bill) => (
            <Surface key={bill.id} variant="inset" padding="sm">
              <Chip>{bill.type.toUpperCase()}{bill.number}</Chip>
              <h4 className="mt-2 line-clamp-2 text-foreground">{bill.title}</h4>
              {bill.latestAction && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Latest: </span>
                  {bill.latestAction.text}
                </p>
              )}
            </Surface>
          ))}

          {!loading && (
            <Button asChild variant="outline" className="mt-4 w-full">
              <a
                href="https://congress.gov/search?q=%7B%22source%22%3A%22legislation%22%7D"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Search all bills on Congress.gov
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AffectedSection = () => {
  const { bills, loading } = useHealthBills(50);
  const [selectedGroup, setSelectedGroup] = useState<AudienceGroup | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewUpdates = (group: AudienceGroup) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2" data-stagger>
        {audienceGroups.map((group) => (
          <Surface
            key={group.id}
            variant="interactive"
            padding="lg"
            role="button"
            tabIndex={0}
            aria-label={`See bills for ${groupNoun(group)}`}
            onClick={() => handleViewUpdates(group)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleViewUpdates(group);
              }
            }}
          >
            <div className="flex items-start gap-4">
              <IconTile icon={group.icon} size="md" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg text-foreground">{group.title}</h3>
                  <Chip>{group.ageRange}</Chip>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{group.description}</p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {group.keyTopics.map((topic) => (
                    <Chip key={topic}>{topic}</Chip>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1.5 text-sm text-accent" aria-hidden="true">
                  See bills for {groupNoun(group)}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Surface>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="mb-4 text-base text-muted-foreground">Want to explore all current health legislation?</p>
        <Button asChild variant="outline">
          <a
            href="https://congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22subject%22%3A%22Health%22%7D"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Browse all health bills on Congress.gov
          </a>
        </Button>
      </div>

      <AudienceBillsModal
        group={selectedGroup}
        open={modalOpen}
        onOpenChange={setModalOpen}
        bills={bills}
        loading={loading}
      />
    </>
  );
};

export default AffectedSection;
