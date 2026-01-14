-- ============================================
-- CLUB BOOK SUGGESTIONS
-- ============================================

CREATE TABLE public.club_book_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  suggested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, book_id)
);

-- RLS policies
ALTER TABLE public.club_book_suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone can view suggestions for clubs they're in
CREATE POLICY "club_suggestions_select" ON public.club_book_suggestions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_members.club_id = club_book_suggestions.club_id
      AND club_members.user_id = auth.uid()
    )
  );

-- Members can suggest books
CREATE POLICY "club_suggestions_insert" ON public.club_book_suggestions
  FOR INSERT WITH CHECK (
    auth.uid() = suggested_by
    AND EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_members.club_id = club_book_suggestions.club_id
      AND club_members.user_id = auth.uid()
    )
  );

-- Suggester or club owner can delete suggestions
CREATE POLICY "club_suggestions_delete" ON public.club_book_suggestions
  FOR DELETE USING (
    suggested_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_members.club_id = club_book_suggestions.club_id
      AND club_members.user_id = auth.uid()
      AND club_members.role = 'owner'
    )
  );
