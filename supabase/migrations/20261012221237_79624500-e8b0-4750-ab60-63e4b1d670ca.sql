-- Newsletter: no direct reads; expose only a count
DROP POLICY IF EXISTS "Authenticated can view subscribers" ON public.newsletter_subscribers;
CREATE OR REPLACE FUNCTION public.get_subscriber_count()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT count(*) FROM public.newsletter_subscribers $$;
GRANT EXECUTE ON FUNCTION public.get_subscriber_count() TO anon, authenticated;

-- Comments: store only a display name, never a full email
UPDATE public.bill_comments SET user_email = split_part(user_email, '@', 1) WHERE user_email LIKE '%@%';
ALTER TABLE public.bill_comments ADD CONSTRAINT bill_comments_no_full_email CHECK (position('@' in user_email) = 0);

-- Votes: users read only their own; totals via function
DROP POLICY IF EXISTS "Anyone authenticated can view votes" ON public.comment_votes;
CREATE POLICY "Users can view their own votes" ON public.comment_votes
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.get_comment_scores(_comment_ids uuid[])
RETURNS TABLE(comment_id uuid, score bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT v.comment_id, sum(v.vote)::bigint FROM public.comment_votes v WHERE v.comment_id = ANY(_comment_ids) GROUP BY v.comment_id $$;
GRANT EXECUTE ON FUNCTION public.get_comment_scores(uuid[]) TO authenticated;