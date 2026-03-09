import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Users, Briefcase, Heart, ArrowRight, FileText, ExternalLink } from "lucide-react";
import { useRecentBills, type Bill } from "@/hooks/useCongressApi";

const audienceGroups = [
  {
    id: "students",
    icon: GraduationCap,
    title: "Students & Young Adults",
    ageRange: "18-26",
    description: "Stay on parents' insurance until 26, access campus mental health services, and understand student loan impacts on healthcare choices.",
    keyTopics: ["Insurance Coverage", "Mental Health", "Preventive Care", "Campus Resources"],
    searchTerms: ["student", "young adult", "college", "university", "mental health", "education"],
    color: "bg-info/10 text-info border-info/20",
    iconBg: "bg-info",
  },
  {
    id: "families",
    icon: Users,
    title: "Families with Children",
    ageRange: "All ages",
    description: "Navigate CHIP and Medicaid for kids, understand school vaccination requirements, and find affordable family coverage options.",
    keyTopics: ["Children's Health Insurance", "Vaccines", "Pediatric Care", "Family Plans"],
    searchTerms: ["children", "family", "pediatric", "chip", "vaccination", "maternal"],
    color: "bg-success/10 text-success border-success/20",
    iconBg: "bg-success",
  },
  {
    id: "workers",
    icon: Briefcase,
    title: "Workers & Employees",
    ageRange: "26-64",
    description: "Understand employer benefits, COBRA coverage between jobs, marketplace options for self-employed, and workplace health policies.",
    keyTopics: ["Employer Insurance", "COBRA", "Marketplace Plans", "Workplace Rights"],
    searchTerms: ["employer", "workplace", "worker", "cobra", "affordable care", "labor"],
    color: "bg-warning/10 text-warning border-warning/20",
    iconBg: "bg-warning",
  },
  {
    id: "seniors",
    icon: Heart,
    title: "Seniors & Retirees",
    ageRange: "65+",
    description: "Navigate Medicare Parts A, B, C, and D, understand prescription drug coverage, and access senior-specific health programs.",
    keyTopics: ["Medicare", "Prescription Drugs", "Long-term Care", "Preventive Services"],
    searchTerms: ["medicare", "senior", "elderly", "prescription drug", "nursing", "retirement"],
    color: "bg-accent/10 text-accent border-accent/20",
    iconBg: "bg-accent",
  },
];

interface AudienceBillsModalProps {
  group: typeof audienceGroups[0] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bills: Bill[];
  loading: boolean;
}

const AudienceBillsModal = ({ group, open, onOpenChange, bills, loading }: AudienceBillsModalProps) => {
  if (!group) return null;

  // Filter bills relevant to this group
  const relevantBills = bills.filter(bill => {
    const titleLower = bill.title.toLowerCase();
    return group.searchTerms.some(term => titleLower.includes(term));
  }).slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${group.iconBg} flex items-center justify-center`}>
              <group.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            Bills Affecting {group.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          )}

          {!loading && relevantBills.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No specific bills found for {group.title} in recent legislation.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try checking Congress.gov for more comprehensive results.
              </p>
            </div>
          )}

          {!loading && relevantBills.map((bill) => (
            <div
              key={bill.id}
              className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {bill.type.toUpperCase()}{bill.number}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-foreground line-clamp-2">
                    {bill.title}
                  </h4>
                  {bill.latestAction && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      <span className="font-medium">Latest: </span>
                      {bill.latestAction.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!loading && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => window.open('https://congress.gov/search?q=%7B%22source%22%3A%22legislation%22%7D', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Search All Bills on Congress.gov
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AffectedSection = () => {
  const { bills, loading } = useRecentBills(50);
  const [selectedGroup, setSelectedGroup] = useState<typeof audienceGroups[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewUpdates = (group: typeof audienceGroups[0]) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  return (
    <section id="affected" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">

        {/* Audience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {audienceGroups.map((group, index) => (
            <Card
              key={group.id}
              className="group cursor-pointer border-border/50 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleViewUpdates(group)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${group.iconBg} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <group.icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {group.title}
                      </h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {group.ageRange}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {group.description}
                    </p>

                    {/* Key Topics */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {group.keyTopics.map((topic) => (
                        <span
                          key={topic}
                          className={`text-xs px-2.5 py-1 rounded-full border ${group.color}`}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <button 
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all"
                    >
                      View bills for {group.title.split(' ')[0].toLowerCase()}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Want to explore all current health legislation?</p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.open('https://congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22subject%22%3A%22Health%22%7D', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Browse All Health Bills
          </Button>
        </div>
      </div>

      {/* Audience Bills Modal */}
      <AudienceBillsModal
        group={selectedGroup}
        open={modalOpen}
        onOpenChange={setModalOpen}
        bills={bills}
        loading={loading}
      />
    </section>
  );
};

export default AffectedSection;
