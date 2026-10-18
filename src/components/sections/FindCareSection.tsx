import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Stethoscope, Brain, Pill, Heart, DollarSign, Phone, ArrowRight, Star, Navigation, AlertCircle, Map, List, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCareFinder, CareResult } from "@/hooks/useCareFinder";
import { useFavorites, type FavoriteFacility } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import CareMap from "@/components/sections/CareMap";
import Section from "@/components/layout/Section";
import { Surface, Chip, IconTile, FieldLabel, IconInput } from "@/components/ui/primitives";
import { SegmentedControl } from "@/components/ui/segmented-control";
import MinnesotaResources from "@/components/sections/MinnesotaResources";
import { EmptyState } from "@/components/ui/empty-state";
import { useT } from "@/i18n";

const careCategories = [
  { id: "primary", icon: Stethoscope },
  { id: "mental", icon: Brain },
  { id: "pharmacy", icon: Pill },
  { id: "specialty", icon: Heart },
] as const;

type ViewMode = "list" | "map";

function directionsHref(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

function ResultCard({ result, isFavorite, onToggleFavorite }: { result: CareResult; isFavorite: boolean; onToggleFavorite: () => void }) {
  const t = useT();
  return (
    <Surface padding="md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="min-w-0 flex-1 truncate text-lg font-medium text-foreground">{result.name}</h4>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? t("care.removeFavorite", { name: result.name }) : t("care.saveFavorite", { name: result.name })}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.distanceKm != null && (
              <span className="text-foreground">{(result.distanceKm * 0.621371).toFixed(1)} mi · </span>
            )}
            {result.address}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {result.rating && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-foreground">{result.rating}</span> ({result.totalRatings})
              </span>
            )}
            {result.isOpen !== null && (
              <Chip tone={result.isOpen ? "success" : "neutral"} dot>
                {result.isOpen ? t("care.openNow") : t("care.closed")}
              </Chip>
            )}
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full gap-1.5 sm:w-auto sm:shrink-0">
          <a href={directionsHref(result.address)} target="_blank" rel="noopener noreferrer" aria-label={t("care.directionsTo", { name: result.name })}>
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" /> {t("care.directions")}
          </a>
        </Button>
      </div>
    </Surface>
  );
}

function FavoriteCard({ fav, onRemove }: { fav: FavoriteFacility; onRemove: () => void }) {
  const t = useT();
  return (
    <Surface padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="min-w-0 flex-1 truncate text-sm text-foreground">{fav.name}</h4>
            <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label={t("care.removeFavorite", { name: fav.name })}>
              <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{fav.address}</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1">
          <a href={directionsHref(fav.address)} target="_blank" rel="noopener noreferrer" aria-label={t("care.directionsTo", { name: fav.name })}>
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" /> {t("care.directions")}
          </a>
        </Button>
      </div>
    </Surface>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Surface key={i} padding="md">
          <Skeleton className="mb-2 h-5 w-2/3" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-1/3" />
        </Surface>
      ))}
    </div>
  );
}

const FindCareSection = () => {
  const [zipCode, setZipCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lowCostOnly, setLowCostOnly] = useState(false);
  const [includeTelehealth, setIncludeTelehealth] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const { toast } = useToast();
  const t = useT();
  const viewOptions: { value: ViewMode; label: string; icon: typeof List }[] = [
    { value: "list", label: t("care.view.list"), icon: List },
    { value: "map", label: t("care.view.map"), icon: Map },
  ];
  const { results, loading, error, searched, search, location } = useCareFinder();
  const { user } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const handleSearch = () => {
    if (!zipCode.trim()) {
      toast({ title: t("care.enterLocationTitle"), description: t("care.enterLocationBody"), variant: "destructive" });
      return;
    }
    search({ zipCode: zipCode.trim(), category: selectedCategory, lowCostOnly, includeTelehealth });
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <Section first id="care">
      <div className="grid items-start gap-6 lg:grid-cols-5">
        {/* Search */}
        <div className="space-y-4 lg:col-span-2">
          <Surface padding="lg">
            <h3 className="mb-4 text-lg text-foreground">{t("care.findResources")}</h3>
            {/* FieldLabel's prop type omits htmlFor; spread keeps the association until primitives.tsx widens it. */}
            <FieldLabel htmlFor="care-location">{t("care.locationLabel")}</FieldLabel>
            <div className="mb-4">
              <IconInput
                icon={MapPin}
                id="care-location"
                type="text"
                autoComplete="postal-code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("care.locationPlaceholder")}
              />
            </div>
            <div className="mb-6">
              <p id="care-type-label" className="mb-2 block text-sm text-foreground">{t("care.typeQuestion")}</p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="care-type-label">
                {careCategories.map((cat) => {
                  const selected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`flex min-h-11 items-center gap-2 rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selected ? "border-foreground bg-secondary" : "border-border hover:bg-secondary"
                      }`}
                    >
                      <IconTile icon={cat.icon} size="sm" />
                      <span className="text-sm text-foreground">{t(`care.cat.${cat.id}.title`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mb-6 space-y-3">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={lowCostOnly} onChange={(e) => setLowCostOnly(e.target.checked)} className="h-4 w-4 accent-foreground" />
                <span className="text-sm text-muted-foreground"><DollarSign className="mr-1 inline h-4 w-4" aria-hidden="true" />{t("care.lowCostOnly")}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={includeTelehealth} onChange={(e) => setIncludeTelehealth(e.target.checked)} className="h-4 w-4 accent-foreground" />
                <span className="text-sm text-muted-foreground"><Phone className="mr-1 inline h-4 w-4" aria-hidden="true" />{t("care.includeTelehealth")}</span>
              </label>
            </div>
            {!user && (
              <p className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
                <span>{t("care.signInNotice")}</span>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">{t("nav.signIn")}</Link>
                </Button>
              </p>
            )}
            <Button size="lg" className="w-full" onClick={handleSearch} disabled={loading}>
              {loading ? t("care.searching") : t("care.searchButton")}
            </Button>
          </Surface>

          {/* Saved facilities */}
          {user && favorites.length > 0 && (
            <Surface padding="sm">
              <div className="mb-3 flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h4 className="text-sm text-foreground">{t("care.savedFacilities", { n: favorites.length })}</h4>
              </div>
              <div className="max-h-[300px] space-y-2 overflow-y-auto">
                {favorites.map((fav) => (
                  <FavoriteCard
                    key={fav.id}
                    fav={fav}
                    onRemove={() => toggleFavorite({ id: fav.place_id, name: fav.name, address: fav.address, rating: fav.rating, totalRatings: 0, isOpen: null, lat: fav.lat ?? 0, lng: fav.lng ?? 0, types: [] })}
                  />
                ))}
              </div>
            </Surface>
          )}
        </div>

        {/* Results / categories */}
        <div className="space-y-4 lg:col-span-3">
          {loading && <ResultsSkeleton />}

          {!loading && searched && error && (
            <EmptyState variant="error" icon={AlertCircle} title={t("care.errorTitle")} body={error} />
          )}

          {!loading && searched && !error && results.length === 0 && (
            <EmptyState icon={MapPin} title={t("care.noResultsTitle")} body={t("care.noResultsBody")} />
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3" data-stagger>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground" aria-live="polite">{location ? t("care.resultsNear", { n: results.length, place: location.label }) : t("care.resultsCount", { n: results.length })}</p>
                <SegmentedControl<ViewMode> value={viewMode} onChange={setViewMode} options={viewOptions} label={t("care.resultsView")} />
              </div>

              {viewMode === "map" && (
                <CareMap results={results} selectedId={selectedResultId} onSelect={setSelectedResultId} />
              )}

              {results.map((result) => (
                <ResultCard key={result.id} result={result} isFavorite={isFavorite(result.id)} onToggleFavorite={() => toggleFavorite(result)} />
              ))}
            </div>
          )}

          {!searched && !loading && careCategories.map((category) => {
            const selected = selectedCategory === category.id;
            return (
              <Surface
                key={category.id}
                variant="interactive"
                padding="md"
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={t(selected ? "care.deselect" : "care.select", { name: t(`care.cat.${category.id}.title`) })}
                onClick={() => handleCategoryClick(category.id)}
                onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCategoryClick(category.id);
                  }
                }}
                className={selected ? "border-foreground" : undefined}
              >
                <div className="flex items-center gap-4">
                  <IconTile icon={category.icon} size="md" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg text-foreground">{t(`care.cat.${category.id}.title`)}</h4>
                    <p className="text-sm text-muted-foreground">{t(`care.cat.${category.id}.description`)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </div>
              </Surface>
            );
          })}

          {!searched && !loading && <MinnesotaResources />}

          {/* Emergency */}
          <Surface padding="md" className="border-destructive/40">
            <div className="flex items-start gap-3">
              <IconTile icon={Phone} className="text-destructive" />
              <div>
                <h4 className="mb-1 text-lg text-foreground">{t("care.emergencyTitle")}</h4>
                <p className="mb-2 text-sm text-muted-foreground">{t("care.emergencyBody")}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a href="tel:911" className="text-destructive hover:underline">{t("care.call911")}</a>
                  <span className="text-muted-foreground" aria-hidden="true">·</span>
                  <a href="tel:988" className="text-destructive hover:underline">{t("care.lifeline988")}</a>
                </div>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </Section>
  );
};

export default FindCareSection;
