import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, ArrowRight, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

const newsItems = [
  {
    id: 1,
    category: "Mental Health",
    title: "New Mental Health Parity Rules Take Effect",
    summary: "Insurance companies must now cover mental health treatment the same as physical health. This means lower copays and better access to therapy.",
    impact: "positive",
    affectedGroups: ["Students", "Workers", "Families"],
    timeAgo: "2 hours ago",
    readTime: "3 min read",
  },
  {
    id: 2,
    category: "Medicare",
    title: "Drug Price Negotiations Begin for 10 Medications",
    summary: "The government will negotiate prices on common drugs for diabetes, heart disease, and blood clots. Savings could reach 40-60% by next year.",
    impact: "positive",
    affectedGroups: ["Seniors", "Chronic Conditions"],
    timeAgo: "5 hours ago",
    readTime: "4 min read",
  },
  {
    id: 3,
    category: "Medicaid",
    title: "State Proposes Work Requirements for Coverage",
    summary: "A proposal would require some Medicaid recipients to work or volunteer 20 hours weekly. Public comment period is open until March 15.",
    impact: "alert",
    affectedGroups: ["Low-Income Adults", "Workers"],
    timeAgo: "1 day ago",
    readTime: "5 min read",
  },
  {
    id: 4,
    category: "Reproductive Health",
    title: "Telehealth Prescriptions for Contraception Expanded",
    summary: "New guidelines allow more healthcare providers to prescribe birth control via video visits, increasing access especially in rural areas.",
    impact: "positive",
    affectedGroups: ["Women", "Rural Communities"],
    timeAgo: "2 days ago",
    readTime: "3 min read",
  },
];

const getImpactIcon = (impact: string) => {
  switch (impact) {
    case "positive":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "alert":
      return <AlertCircle className="w-4 h-4 text-warning" />;
    default:
      return <TrendingUp className="w-4 h-4 text-info" />;
  }
};

const getImpactLabel = (impact: string) => {
  switch (impact) {
    case "positive":
      return "Expands Access";
    case "alert":
      return "Action Needed";
    default:
      return "Trending";
  }
};

const NewsSection = () => {
  return (
    <section id="news" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Health Policy Updates
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Breaking News, Translated for You
          </h2>
          <p className="text-lg text-muted-foreground">
            Complex policies explained in plain language. See what's changing, who's affected, and what you can do.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {newsItems.map((item, index) => (
            <Card
              key={item.id}
              className="group cursor-pointer border-border/50 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs font-medium">
                    {item.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getImpactIcon(item.impact)}
                    <span>{getImpactLabel(item.impact)}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {item.summary}
                </p>
                
                {/* Affected Groups */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.affectedGroups.map((group) => (
                    <span
                      key={group}
                      className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {group}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.timeAgo}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.readTime}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read more
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View all health updates
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
