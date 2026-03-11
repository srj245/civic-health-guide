import { useTrackedBills } from "@/hooks/useTrackedBills";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Calendar, ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  usePageTitle("My Dashboard", "Track and follow health bills that matter to you.");
  const { user } = useAuth();
  const { trackedBills, loading, toggleTrack } = useTrackedBills();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="bg-background min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <LogIn className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Sign in to track bills</h2>
            <p className="text-muted-foreground mb-4">Create an account to save and follow health bills that matter to you.</p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background animate-fade-in">
      <div className="px-6 py-8 md:px-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">My Dashboard</h1>
        <p className="text-muted-foreground mb-6">Bills you're tracking · {trackedBills.length} total</p>
      </div>

      <section className="px-6 pb-12 md:px-10">
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
              ))}
            </div>
          )}

          {!loading && trackedBills.length === 0 && (
            <div className="text-center py-16">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2">No tracked bills yet</h3>
              <p className="text-muted-foreground mb-4">Head to Health News to find and track bills that interest you.</p>
              <Button variant="outline" onClick={() => navigate("/news")}>
                Browse Health Bills <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {!loading && trackedBills.length > 0 && (
            <div className="space-y-3">
              {trackedBills.map((bill) => (
                <Card key={bill.id} className="border-border hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {bill.bill_type.toUpperCase()}{bill.bill_number}
                          </Badge>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {bill.congress}th Congress
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{bill.bill_title}</h3>
                        {bill.latest_action_text && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">
                              {bill.latest_action_date && <span className="font-medium">{bill.latest_action_date}: </span>}
                              {bill.latest_action_text}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary shrink-0"
                        onClick={() => toggleTrack({
                          id: bill.bill_id,
                          title: bill.bill_title,
                          congress: bill.congress,
                          type: bill.bill_type,
                          number: bill.bill_number,
                          updateDate: bill.created_at,
                          latestAction: bill.latest_action_text ? {
                            actionDate: bill.latest_action_date || '',
                            text: bill.latest_action_text,
                          } : undefined,
                        })}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
