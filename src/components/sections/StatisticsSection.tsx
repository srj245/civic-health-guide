import { TrendingUp, Users, FileText, MapPin } from "lucide-react";

const stats = [
  { icon: FileText, value: "500+", label: "Bills Tracked", desc: "Health-related legislation monitored" },
  { icon: Users, value: "26M+", label: "People Affected", desc: "Americans impacted by policy changes" },
  { icon: MapPin, value: "50", label: "States Covered", desc: "Nationwide healthcare resource data" },
  { icon: TrendingUp, value: "Daily", label: "Updates", desc: "Real-time legislative tracking" },
];

const StatisticsSection = () => {
  return (
    <section className="py-14 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">By the Numbers</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Health Policy at a Glance
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
