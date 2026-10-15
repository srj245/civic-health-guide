import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Calendar, LogIn } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import { Chip, Surface } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrackedBills } from "@/hooks/useTrackedBills";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ordinal } from "@/lib/format";

const Dashboard = () => {
  usePageTitle("Your bills", "Track and follow health bills that matter to you.");
  const { user } = useAuth();
  const { trackedBills, loading, toggleTrack } = useTrackedBills();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Section>
        <div className="mx-auto max-w-md">
          <EmptyState
            icon={LogIn}
            title="Sign in to track bills"
            body="Create an account to save and follow the health bills that matter to you."
            action={<Button onClick={() => navigate("/auth")}>Sign in</Button>}
          />
        </div>
      </Section>
    );
  }

  return (
    <div>
      <PageHero badge="Tracked" title="Your bills" subtitle={`Bills you are following · ${trackedBills.length} total`} />

      <Section first width="narrow">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Surface key={i} padding="md">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-5 w-3/4" />
              </Surface>
            ))}
          </div>
        )}

        {!loading && trackedBills.length === 0 && (
          <EmptyState
            icon={Bookmark}
            title="No tracked bills yet"
            body="Open the bills page to find and track bills that interest you."
            action={
              <Button asChild variant="outline">
                <Link to="/news">Browse health bills</Link>
              </Button>
            }
          />
        )}

        {!loading && trackedBills.length > 0 && (
          <div className="space-y-3" data-stagger>
            {trackedBills.map((bill) => (
              <Surface key={bill.id} as="article" padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Chip>
                        {bill.bill_type.toUpperCase()}
                        {bill.bill_number}
                      </Chip>
                      <Chip>{ordinal(bill.congress)} Congress</Chip>
                    </div>
                    <h3 className="line-clamp-2 text-lg text-foreground">{bill.bill_title}</h3>
                    {bill.latest_action_text && (
                      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                        <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="line-clamp-1">
                          {bill.latest_action_date && <span className="text-foreground">{bill.latest_action_date}: </span>}
                          {bill.latest_action_text}
                        </span>
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Untrack bill"
                    className="shrink-0 text-foreground"
                    onClick={() =>
                      toggleTrack({
                        id: bill.bill_id,
                        title: bill.bill_title,
                        congress: bill.congress,
                        type: bill.bill_type,
                        number: bill.bill_number,
                        updateDate: bill.created_at,
                        latestAction: bill.latest_action_text
                          ? { actionDate: bill.latest_action_date || "", text: bill.latest_action_text }
                          : undefined,
                      })
                    }
                  >
                    <Bookmark className="h-4 w-4 fill-current" aria-hidden="true" />
                  </Button>
                </div>
              </Surface>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default Dashboard;
