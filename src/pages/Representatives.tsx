import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, ExternalLink, Users, Search, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHero from "@/components/sections/PageHero";
import RepDetailModal from "@/components/sections/RepDetailModal";
import { usePageTitle } from "@/hooks/usePageTitle";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",
  IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",
  MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",
  NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",
  ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",
  RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",
  UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",
  WI:"Wisconsin",WY:"Wyoming",
};

interface Representative {
  name: string;
  party: string;
  state: string;
  district: number | null;
  chamber: string;
  url: string;
  depiction: string | null;
}

const Representatives = () => {
  usePageTitle("Find Your Representatives", "Look up your congressional representatives and send them a message about health policy.");
  const [state, setState] = useState("");
  const [members, setMembers] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [repModalOpen, setRepModalOpen] = useState(false);

  const handleSearch = async () => {
    if (!state) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('find-representatives', {
        body: { state },
      });
      if (fnError) throw fnError;
      setMembers(data.members || []);
    } catch (e: any) {
      setError(e.message || "Failed to find representatives");
    } finally {
      setLoading(false);
    }
  };

  const getEmailSubject = (repName: string) =>
    encodeURIComponent(`Health Policy Concerns from a Constituent`);

  const getEmailBody = (repName: string) =>
    encodeURIComponent(
      `Dear ${repName},\n\nAs your constituent, I am writing to express my concerns about healthcare policy in our community. Access to affordable healthcare is critically important to me and my family.\n\nI urge you to support legislation that:\n- Protects access to affordable health insurance\n- Expands mental health services\n- Reduces prescription drug costs\n\nThank you for your service and for considering my views.\n\nSincerely,\n[Your Name]\n[Your Address]`
    );

  const getPartyColor = (party: string) => {
    if (party?.toLowerCase().includes("republican")) return "bg-destructive/10 text-destructive";
    if (party?.toLowerCase().includes("democrat")) return "bg-info/10 text-info-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="bg-background">
      <PageHero
        icon={Users}
        badge="Contact Your Reps"
        title="Find Your Representatives"
        subtitle="Look up your congressional representatives and send them a message about health policy."
      />

      <section className="px-6 py-8 md:px-10">
        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full sm:w-64" aria-label="Select your state">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATE_NAMES[s]} ({s})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={!state || loading}>
              <Search className="w-4 h-4 mr-2" />
              Find Representatives
            </Button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}><CardContent className="p-5"><Skeleton className="h-24 w-full" /></CardContent></Card>
              ))}
            </div>
          )}

          {/* Error */}
          {error && <p className="text-destructive text-sm">{error}</p>}

          {/* Results */}
          {!loading && members.length > 0 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Found {members.length} representative{members.length !== 1 ? 's' : ''} for {STATE_NAMES[state]}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {members.map((rep, idx) => (
                  <Card key={idx} className="border-border hover:shadow-card-hover transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {rep.depiction ? (
                          <img
                            src={rep.depiction}
                            alt={rep.name}
                            className="w-16 h-16 rounded-xl object-cover bg-muted"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                            <Users className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{rep.name}</h3>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge variant="outline" className={getPartyColor(rep.party)}>
                              {rep.party}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {rep.chamber === 'Senate' ? 'Senator' : `District ${rep.district}`}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRep(rep);
                            setRepModalOpen(true);
                          }}
                        >
                          <Award className="w-4 h-4 mr-1" />
                          Health Score
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            window.open(
                              `mailto:?subject=${getEmailSubject(rep.name)}&body=${getEmailBody(rep.name)}`,
                              '_blank'
                            )
                          }
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const match = rep.url?.match(/member\/([A-Z]\d+)/);
                            const publicUrl = match
                              ? `https://www.congress.gov/member/${rep.name.toLowerCase().replace(/[^a-z]/g, '-')}/${match[1]}`
                              : `https://www.congress.gov/search?q=${encodeURIComponent(rep.name)}`;
                            window.open(publicUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && searched && members.length === 0 && !error && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No representatives found for this state. Try a different selection.</p>
            </div>
          )}
        </div>
      </section>

      {selectedRep && (
        <RepDetailModal
          repName={selectedRep.name}
          repUrl={selectedRep.url}
          open={repModalOpen}
          onOpenChange={setRepModalOpen}
        />
      )}
    </div>
  );
};

export default Representatives;

export default Representatives;
