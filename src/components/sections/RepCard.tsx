import { useState } from "react";
import { Check, Copy, ExternalLink, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  draftMessage,
  partyBadgeClass,
  partyShort,
  publicProfileUrl,
  repTitle,
  type Representative,
} from "@/lib/reps";

interface RepCardProps {
  rep: Representative;
  onShowBills?: (rep: Representative) => void;
}

/**
 * One representative. Members of Congress only accept messages through the
 * contact form on their official site, so the card copies a draft to the
 * clipboard and sends the user to the profile page instead of opening a blank
 * mailto.
 */
const RepCard = ({ rep, onShowBills }: RepCardProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draftMessage(rep));
      setCopied(true);
      toast({
        title: "Draft copied",
        description: "Paste it into the contact form on their official page.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Couldn't copy", description: "Select the text manually.", variant: "destructive" });
    }
  };

  return (
    <article data-spotlight className="lift rounded-lg border border-border bg-card p-4" aria-label={rep.name}>
      <div className="flex items-start gap-3">
        {rep.depiction ? (
          <img
            src={rep.depiction}
            alt=""
            width={56}
            height={56}
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-md bg-muted object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-secondary" aria-hidden="true">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-foreground">{rep.name}</h3>
          <p className="text-sm text-muted-foreground">{repTitle(rep)}</p>
          <span
            className={`mt-1.5 inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${partyBadgeClass(rep.party)}`}
          >
            {partyShort(rep.party)} · {rep.party}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={copyDraft} aria-live="polite">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy message"}
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={publicProfileUrl(rep)} target="_blank" rel="noopener noreferrer">
            Contact page
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
        {onShowBills && (
          <Button size="sm" variant="ghost" onClick={() => onShowBills(rep)}>
            <FileText className="h-4 w-4" aria-hidden="true" />
            Health bills
          </Button>
        )}
      </div>
    </article>
  );
};

export default RepCard;
