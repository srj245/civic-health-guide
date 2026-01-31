import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Stethoscope, Brain, Pill, Heart, DollarSign, Phone, ExternalLink } from "lucide-react";

const careCategories = [
  {
    id: "primary",
    icon: Stethoscope,
    title: "Primary Care",
    description: "Community health centers and clinics for checkups and general care",
    color: "bg-primary",
  },
  {
    id: "mental",
    icon: Brain,
    title: "Mental Health",
    description: "Counseling, therapy, and crisis support services",
    color: "bg-info",
  },
  {
    id: "pharmacy",
    icon: Pill,
    title: "Low-Cost Rx",
    description: "Discount prescription programs and pharmacy assistance",
    color: "bg-success",
  },
  {
    id: "specialty",
    icon: Heart,
    title: "Specialty Care",
    description: "Specialists with sliding-scale fees and charity programs",
    color: "bg-accent",
  },
];

const FindCareSection = () => {
  return (
    <section id="care" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              Find Care Near You
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Connect with Healthcare in Your Community
            </h2>
            <p className="text-lg text-muted-foreground">
              We help you find clinics, mental health services, and low-cost care options based on your location and needs.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Search Card */}
            <Card className="lg:col-span-2 border-border/50 bg-card shadow-card overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Find resources near you
                </h3>
                
                {/* Location Input */}
                <div className="relative mb-4">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter your zip code or city"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Service Type */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    What type of care do you need?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {careCategories.map((cat) => (
                      <button
                        key={cat.id}
                        className="flex items-center gap-2 p-3 rounded-xl border border-border bg-background hover:bg-secondary hover:border-primary/30 transition-all text-left group"
                      >
                        <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center flex-shrink-0`}>
                          <cat.icon className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {cat.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-input accent-primary" />
                    <span className="text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Show only free/low-cost options
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-input accent-primary" />
                    <span className="text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Include telehealth options
                    </span>
                  </label>
                </div>

                <Button variant="default" className="w-full" size="lg">
                  Search for Care
                </Button>
              </CardContent>
            </Card>

            {/* Care Categories Info */}
            <div className="lg:col-span-3 space-y-4">
              {careCategories.map((category, index) => (
                <Card
                  key={category.id}
                  className="border-border/50 bg-card shadow-sm hover:shadow-card transition-shadow cursor-pointer group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <category.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {category.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Emergency Callout */}
              <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-destructive-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Need immediate help?
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      If you're experiencing a medical or mental health emergency
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <a href="tel:911" className="font-medium text-destructive hover:underline">
                        Call 911
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <a href="tel:988" className="font-medium text-destructive hover:underline">
                        988 Suicide & Crisis Lifeline
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindCareSection;
