import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Chip, Surface, type Tone } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ImpactProfile, ImpactResult, ImpactSource } from "@/pages/Impact";

interface Props {
  profile: ImpactProfile;
  results: ImpactResult[];
  sources?: ImpactSource[];
  loading: boolean;
  error: string | null;
  onReset: () => void;
}

const relevanceConfig: Record<ImpactResult["relevance"], { tone: Tone; label: string }> = {
  high: { tone: "destructive", label: "High impact" },
  medium: { tone: "warning", label: "Medium impact" },
  low: { tone: "neutral", label: "Low impact" },
};

const ImpactResults = ({ profile, results, sources = [], loading, error, onReset }: Props) => {
  const { toast } = useToast();
  const sourceById = new Map(sources.map((s) => [s.id, s]));

  const handleShare = async () => {
    const text = results.map((r) => `• ${r.billTitle} (${r.relevance} impact): ${r.impact}`).join("\n");
    const full = `My CivicCare Impact Report\n${profile.ageRange} · ${profile.insuranceType} · ${profile.state}\n\n${text}\n\nGenerated at civiccare.app`;
    if (navigator.share) {
      try { await navigator.share({ title: "My CivicCare Impact Report", text: full }); } catch { /* user dismissed the share sheet */ }
    } else {
      await navigator.clipboard.writeText(full);
      toast({ title: "Copied to clipboard", description: "Share your impact report with others." });
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl tracking-tight text-foreground">Your results</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.ageRange} · {profile.insuranceType} · {profile.state}
          </p>
        </div>
        <div className="flex gap-2">
          {!loading && !error && results.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> Share
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onReset}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Start over
          </Button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <Surface key={i} padding="md">
              <Skeleton className="mb-3 h-6 w-48" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Surface>
          ))}
        </div>
      )}

      {error && (
        <EmptyState
          variant="error"
          title={error}
          action={<Button variant="outline" onClick={onReset}>Try again</Button>}
        />
      )}

      {!loading && !error && results.length > 0 && (
        <div className="space-y-4" data-stagger>
          {results.map((result, i) => {
            const config = relevanceConfig[result.relevance];
            const source = sourceById.get(result.billId);
            return (
              <Surface key={i} padding="md">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-lg text-foreground">{result.billTitle}</h3>
                  <Chip tone={config.tone} dot className="shrink-0 self-start">
                    {config.label}
                  </Chip>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{result.impact}</p>
                {source && (
                  <div className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    <p>
                      <span className="text-foreground">Official record:</span>{" "}
                      {source.type}{source.number}, {source.congress}th Congress
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center gap-1 text-accent underline underline-offset-2 hover:text-foreground"
                        >
                          Congress.gov <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                    </p>
                    {source.latestAction && (
                      <p>
                        <span className="text-foreground">Latest action:</span>{" "}
                        {source.latestAction}
                        {source.latestActionDate ? ` (${source.latestActionDate})` : ""}
                      </p>
                    )}
                  </div>
                )}
              </Surface>
            );
          })}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <EmptyState
          title="No matching bills found"
          body="Try adjusting your selections."
          action={<Button variant="outline" onClick={onReset}>Start over</Button>}
        />
      )}
    </div>
  );
};

export default ImpactResults;
