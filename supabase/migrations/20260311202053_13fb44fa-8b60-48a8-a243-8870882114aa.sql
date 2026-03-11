
CREATE TABLE public.bill_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bill_id text NOT NULL,
  content text NOT NULL,
  user_email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_bill_comments_bill_id ON public.bill_comments(bill_id);
CREATE INDEX idx_bill_comments_created_at ON public.bill_comments(created_at DESC);

ALTER TABLE public.bill_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read comments (public discussion)
CREATE POLICY "Anyone can view comments"
ON public.bill_comments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert their own comments"
ON public.bill_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.bill_comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.bill_comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for live discussion
ALTER PUBLICATION supabase_realtime ADD TABLE public.bill_comments;
