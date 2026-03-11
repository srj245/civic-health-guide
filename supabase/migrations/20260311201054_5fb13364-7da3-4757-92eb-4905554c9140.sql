
CREATE TABLE public.tracked_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bill_id text NOT NULL,
  bill_title text NOT NULL,
  congress integer NOT NULL DEFAULT 119,
  bill_type text NOT NULL,
  bill_number integer NOT NULL,
  latest_action_text text,
  latest_action_date text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, bill_id)
);

ALTER TABLE public.tracked_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tracked bills"
ON public.tracked_bills FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracked bills"
ON public.tracked_bills FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked bills"
ON public.tracked_bills FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracked bills"
ON public.tracked_bills FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
