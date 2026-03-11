import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Stethoscope, Brain, Pill, Heart, DollarSign, Phone, ExternalLink, Star, Navigation, AlertCircle, Map, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCareFinder, CareResult } from "@/hooks/useCareFinder";
import CareMap from "@/components/sections/CareMap";

const careCategories = [
  { id: "primary", icon: Stethoscope, title: "Primary Care", description: "Community health centers and clinics for checkups and general care", color: "bg-primary" },
  { id: "mental", icon: Brain, title: "Mental Health", description: "Counseling, therapy, and crisis support services", color: "bg-info" },
  { id: "pharmacy", icon: Pill, title: "Low-Cost Rx", description: "Discount prescription programs and pharmacy assistance", color: "bg-success" },
  { id: "specialty", icon: Heart, title: "Specialty Care", description: "Specialists with sliding-scale fees and charity programs", color: "bg-accent" },
];

function ResultCard({ result }: { result: CareResult }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(result.address)}`;

  return (
    <Card className="border-border/50 bg-card shadow-sm hover:shadow-card transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{result.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{result.address}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {result.rating && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {result.rating} ({result.totalRatings})
                </span>
              )}
              {result.isOpen !== null && (
                <Badge variant={result.isOpen ? "default" : "secondary"} className="text-xs">
                  {result.isOpen ? "Open Now" : "Closed"}
                </Badge>
              )}
            </div>
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              Directions
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4">
            <Skeleton className="h-5 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const FindCareSection = () => {
  const [zipCode, setZipCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lowCostOnly, setLowCostOnly] = useState(false);
  const [includeTelehealth, setIncludeTelehealth] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const { toast } = useToast();
  const { results, loading, error, searched, search } = useCareFinder();

  const handleSearch = () => {
    if (!zipCode.trim()) {
      toast({ title: "Please enter a location", description: "Enter your zip code or city to find care near you.", variant: "destructive" });
      return;
    }
    search({ zipCode: zipCode.trim(), category: selectedCategory, lowCostOnly, includeTelehealth });
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <section id="care" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Search Card */}
            <Card className="lg:col-span-2 border-border/50 bg-card shadow-card overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Find resources near you</h3>
                <div className="relative mb-4">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Enter your zip code or city"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">What type of care do you need?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {careCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left group ${
                          selectedCategory === cat.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:bg-secondary hover:border-primary/30"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center flex-shrink-0`}>
                          <cat.icon className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className={`text-sm font-medium transition-colors ${
                          selectedCategory === cat.id ? "text-primary" : "text-foreground group-hover:text-primary"
                        }`}>{cat.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={lowCostOnly} onChange={(e) => setLowCostOnly(e.target.checked)} className="w-4 h-4 rounded border-input accent-primary" />
                    <span className="text-sm text-muted-foreground"><DollarSign className="w-4 h-4 inline mr-1" />Show only free/low-cost options</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={includeTelehealth} onChange={(e) => setIncludeTelehealth(e.target.checked)} className="w-4 h-4 rounded border-input accent-primary" />
                    <span className="text-sm text-muted-foreground"><Phone className="w-4 h-4 inline mr-1" />Include telehealth options</span>
                  </label>
                </div>
                <Button variant="default" className="w-full" size="lg" onClick={handleSearch} disabled={loading}>
                  {loading ? "Searching..." : "Search for Care"}
                </Button>
              </CardContent>
            </Card>

            {/* Results / Categories */}
            <div className="lg:col-span-3 space-y-4">
              {/* Show results when searched */}
              {loading && <ResultsSkeleton />}

              {!loading && searched && error && (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="p-5 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-sm text-foreground">{error}</p>
                  </CardContent>
                </Card>
              )}

              {!loading && searched && !error && results.length === 0 && (
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-8 text-center">
                    <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-semibold text-foreground mb-1">No results found</h4>
                    <p className="text-sm text-muted-foreground">Try a different zip code or broaden your search category.</p>
                  </CardContent>
                </Card>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{results.length} results found</p>
                    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <List className="w-4 h-4" /> List
                      </button>
                      <button
                        onClick={() => setViewMode("map")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "map" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Map className="w-4 h-4" /> Map
                      </button>
                    </div>
                  </div>

                  {viewMode === "map" && (
                    <CareMap results={results} selectedId={selectedResultId} onSelect={setSelectedResultId} />
                  )}

                  {results.map((result) => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              )}

              {/* Show categories when not searched */}
              {!searched && !loading && careCategories.map((category, index) => (
                <Card
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`border-border/50 bg-card shadow-sm hover:shadow-card transition-shadow cursor-pointer group animate-fade-in-up ${
                    selectedCategory === category.id ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <category.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{category.title}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Emergency Callout - always visible */}
              <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-destructive-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Need immediate help?</h4>
                    <p className="text-sm text-muted-foreground mb-2">If you're experiencing a medical or mental health emergency</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <a href="tel:911" className="font-medium text-destructive hover:underline">Call 911</a>
                      <span className="text-muted-foreground">•</span>
                      <a href="tel:988" className="font-medium text-destructive hover:underline">988 Suicide & Crisis Lifeline</a>
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
