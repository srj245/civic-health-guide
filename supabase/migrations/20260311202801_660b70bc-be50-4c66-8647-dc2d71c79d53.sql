
ALTER TABLE public.bill_comments ADD COLUMN parent_id uuid REFERENCES public.bill_comments(id) ON DELETE CASCADE DEFAULT NULL;
CREATE INDEX idx_bill_comments_parent_id ON public.bill_comments(parent_id);
