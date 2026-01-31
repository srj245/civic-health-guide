import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Briefcase, Heart, ArrowRight } from "lucide-react";

const audienceGroups = [
  {
    id: "students",
    icon: GraduationCap,
    title: "Students & Young Adults",
    ageRange: "18-26",
    description: "Stay on parents' insurance until 26, access campus mental health services, and understand student loan impacts on healthcare choices.",
    keyTopics: ["Insurance Coverage", "Mental Health", "Preventive Care", "Campus Resources"],
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
    color: "bg-accent/10 text-accent border-accent/20",
    iconBg: "bg-accent",
  },
];

const AffectedSection = () => {
  return (
    <section id="affected" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Who's Affected
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Healthcare Updates That Matter to You
          </h2>
          <p className="text-lg text-muted-foreground">
            Select your group to see personalized health policy updates and resources tailored to your life stage.
          </p>
        </div>

        {/* Audience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {audienceGroups.map((group, index) => (
            <Card
              key={group.id}
              className="group cursor-pointer border-border/50 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
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
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                      View updates for {group.title.split(' ')[0].toLowerCase()}
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
          <p className="text-muted-foreground mb-4">Not sure where you fit?</p>
          <Button variant="outline" size="lg">
            Take a quick quiz to personalize your feed
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AffectedSection;
