-- Allow club owners to delete their clubs
CREATE POLICY "Club owners can delete club"
  ON public.clubs FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_id = clubs.id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );
