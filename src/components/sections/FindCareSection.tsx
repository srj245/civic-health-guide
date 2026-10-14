import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Stethoscope, Brain, Pill, Heart, DollarSign, Phone, ExternalLink, Star, Navigation, AlertCircle, Map, List, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCareFinder, CareResult } from "@/hooks/useCareFinder";
import { useFavorites, type FavoriteFacility } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import CareMap from "@/components/sections/CareMap";

const careCategories = [
  { id: "primary", icon: Stethoscope, title: "Primary Care", description: "Community health centers and clinics for checkups and general care", color: "bg-primary" },
  { id: "mental", icon: Brain, title: "Mental Health", description: "Counseling, therapy, and crisis support services", color: "bg-info" },
  { id: "pharmacy", icon: Pill, title: "Low-Cost Rx", description: "Discount prescription programs and pharmacy assistance", color: "bg-success" },
  { id: "specialty", icon: Heart, title: "Specialty Care", description: "Specialists with sliding-scale fees and charity programs", color: "bg-accent" },
];

function ResultCard({ result, isFavorite, onToggleFavorite }: { result: CareResult; isFavorite: boolean; onToggleFavorite: () => void }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(result.address)}`;

  return (
    <Card className="border-border bg-card shadow-none transition-colors hover:border-primary/40">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground truncate">{result.name}</h4>
              <button type="button" onClick={onToggleFavorite} className="shrink-0 p-1 rounded hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-pressed={isFavorite} aria-label={isFavorite ? `Remove ${result.name} from favorites` : `Save ${result.name} to favorites`}>
                <Heart className={`w-4 h-4 transition-colors ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
              </button>
            </div>
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
          <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${result.name} (opens Google Maps)`}>
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" /> Directions
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FavoriteCard({ fav, onRemove }: { fav: FavoriteFacility; onRemove: () => void }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fav.address)}`;
  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground truncate text-sm">{fav.name}</h4>
              <button type="button" onClick={onRemove} className="shrink-0 p-1 rounded hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Remove ${fav.name} from favorites`}>
                <Heart className="w-3.5 h-3.5 fill-destructive text-destructive" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{fav.address}</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0 h-7 px-2 text-xs gap-1">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${fav.name} (opens Google Maps)`}>
              <Navigation className="w-3 h-3" aria-hidden="true" /> Go
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border shadow-none">
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
  const { user } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

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
    <section id="care" className="px-6 py-6 md:px-10 md:py-8 bg-background">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Search Card */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border bg-card shadow-none">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Find resources near you</h3>
                  <label htmlFor="care-location" className="text-sm font-medium text-foreground mb-2 block">Zip code or city</label>
                  <div className="relative mb-4">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="care-location"
                      type="text"
                      autoComplete="postal-code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Enter your zip code or city"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="mb-6">
                    <p id="care-type-label" className="text-sm font-medium text-foreground mb-2 block">What type of care do you need?</p>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="care-type-label">
                      {careCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          aria-pressed={selectedCategory === cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            selectedCategory === cat.id
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:bg-secondary hover:border-primary/30"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center flex-shrink-0`} aria-hidden="true">
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

              {/* Saved Favorites */}
              {user && favorites.length > 0 && (
                <Card className="border-border bg-card shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Bookmark className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">Saved Facilities ({favorites.length})</h4>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {favorites.map((fav) => (
                        <FavoriteCard
                          key={fav.id}
                          fav={fav}
                          onRemove={() => toggleFavorite({ id: fav.place_id, name: fav.name, address: fav.address, rating: fav.rating, totalRatings: 0, isOpen: null, lat: fav.lat ?? 0, lng: fav.lng ?? 0, types: [] })}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Results / Categories */}
            <div className="lg:col-span-3 space-y-4">
              {loading && <ResultsSkeleton />}

              {!loading && searched && error && (
                <Card className="border-destructive/30 bg-destructive/5 shadow-none" role="alert">
                  <CardContent className="p-5 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-sm text-foreground">{error}</p>
                  </CardContent>
                </Card>
              )}

              {!loading && searched && !error && results.length === 0 && (
                <Card className="border-border bg-card shadow-none">
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
                    <p className="text-sm text-muted-foreground" aria-live="polite">{results.length} results found</p>
                    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1" role="group" aria-label="Results view">
                      <button
                        type="button"
                        aria-pressed={viewMode === "list"}
                        onClick={() => setViewMode("list")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <List className="w-4 h-4" aria-hidden="true" /> List
                      </button>
                      <button
                        type="button"
                        aria-pressed={viewMode === "map"}
                        onClick={() => setViewMode("map")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${viewMode === "map" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Map className="w-4 h-4" aria-hidden="true" /> Map
                      </button>
                    </div>
                  </div>

                  {viewMode === "map" && (
                    <CareMap results={results} selectedId={selectedResultId} onSelect={setSelectedResultId} />
                  )}

                  {results.map((result) => (
                    <ResultCard key={result.id} result={result} isFavorite={isFavorite(result.id)} onToggleFavorite={() => toggleFavorite(result)} />
                  ))}
                </div>
              )}

              {!searched && !loading && careCategories.map((category) => (
                <Card
                  key={category.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedCategory === category.id}
                  aria-label={`${selectedCategory === category.id ? "Deselect" : "Select"} ${category.title}`}
                  onClick={() => handleCategoryClick(category.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCategoryClick(category.id);
                    }
                  }}
                  className={`border-border bg-card shadow-none transition-colors cursor-pointer group hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selectedCategory === category.id ? "border-primary" : ""
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                        <category.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{category.title}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Emergency Callout */}
              <div className="p-5 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive flex items-center justify-center flex-shrink-0" aria-hidden="true">
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
