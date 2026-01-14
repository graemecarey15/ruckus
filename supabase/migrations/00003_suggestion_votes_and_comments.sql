-- ============================================
-- CLUB SUGGESTION VOTES
-- ============================================

CREATE TABLE public.club_suggestion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES public.club_book_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- RLS policies
ALTER TABLE public.club_suggestion_votes ENABLE ROW LEVEL SECURITY;

-- Club members can view votes on suggestions in their clubs
CREATE POLICY "club_suggestion_votes_select" ON public.club_suggestion_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_book_suggestions cbs
      JOIN public.club_members cm ON cm.club_id = cbs.club_id
      WHERE cbs.id = club_suggestion_votes.suggestion_id
      AND cm.user_id = auth.uid()
    )
  );

-- Club members can vote on suggestions in their clubs
CREATE POLICY "club_suggestion_votes_insert" ON public.club_suggestion_votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.club_book_suggestions cbs
      JOIN public.club_members cm ON cm.club_id = cbs.club_id
      WHERE cbs.id = club_suggestion_votes.suggestion_id
      AND cm.user_id = auth.uid()
    )
  );

-- Users can remove their own votes
CREATE POLICY "club_suggestion_votes_delete" ON public.club_suggestion_votes
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- CLUB SUGGESTION COMMENTS
-- ============================================

CREATE TABLE public.club_suggestion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES public.club_book_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.club_suggestion_comments ENABLE ROW LEVEL SECURITY;

-- Club members can view comments on suggestions in their clubs
CREATE POLICY "club_suggestion_comments_select" ON public.club_suggestion_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_book_suggestions cbs
      JOIN public.club_members cm ON cm.club_id = cbs.club_id
      WHERE cbs.id = club_suggestion_comments.suggestion_id
      AND cm.user_id = auth.uid()
    )
  );

-- Club members can comment on suggestions in their clubs
CREATE POLICY "club_suggestion_comments_insert" ON public.club_suggestion_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.club_book_suggestions cbs
      JOIN public.club_members cm ON cm.club_id = cbs.club_id
      WHERE cbs.id = club_suggestion_comments.suggestion_id
      AND cm.user_id = auth.uid()
    )
  );

-- Users can update their own comments
CREATE POLICY "club_suggestion_comments_update" ON public.club_suggestion_comments
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own comments, club owners can delete any comment
CREATE POLICY "club_suggestion_comments_delete" ON public.club_suggestion_comments
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.club_book_suggestions cbs
      JOIN public.club_members cm ON cm.club_id = cbs.club_id
      WHERE cbs.id = club_suggestion_comments.suggestion_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_club_suggestion_comments_updated_at
  BEFORE UPDATE ON public.club_suggestion_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
