import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertTriangle, TrendingUp, Minus, Share2, ExternalLink } from "lucide-react";
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

const relevanceConfig = {
  high: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle, label: "High Impact" },
  medium: { color: "bg-warning/10 text-warning-foreground border-warning/20", icon: TrendingUp, label: "Medium Impact" },
  low: { color: "bg-muted text-muted-foreground border-border", icon: Minus, label: "Low Impact" },
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
      toast({ title: "Copied to clipboard!", description: "Share your impact report with others." });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-foreground">Your Personalized Results</h2>
          <p className="text-sm text-muted-foreground">
            {profile.ageRange} · {profile.insuranceType} · {profile.state}
          </p>
        </div>
        <div className="flex gap-2">
          {!loading && !error && results.length > 0 && (
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          )}
          <Button variant="ghost" onClick={onReset}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Start Over
          </Button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={onReset} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, i) => {
            const config = relevanceConfig[result.relevance];
            const Icon = config.icon;
            const source = sourceById.get(result.billId);
            return (
              <Card key={i} className={`border ${config.color.split(" ").find(c => c.startsWith("border-"))}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-medium text-foreground">{result.billTitle}</h3>
                    <Badge className={config.color}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.impact}</p>
                  {source && (
                    <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium text-foreground">Official record:</span>{" "}
                        {source.type}{source.number}, {source.congress}th Congress
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 ml-2 underline underline-offset-2"
                          >
                            Congress.gov <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </p>
                      {source.latestAction && (
                        <p>
                          <span className="font-medium text-foreground">Latest action:</span>{" "}
                          {source.latestAction}
                          {source.latestActionDate ? ` (${source.latestActionDate})` : ""}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No matching bills found. Try adjusting your selections.</p>
            <Button variant="outline" onClick={onReset} className="mt-4">Start Over</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImpactResults;
