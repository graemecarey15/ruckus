-- Allow members to delete their own account.

-- clubs.created_by is the only profile FK without ON DELETE CASCADE,
-- so deleting a user who created any club would fail. Preserve the
-- club for its other members and null out the creator instead.
ALTER TABLE public.clubs ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.clubs DROP CONSTRAINT clubs_created_by_fkey;
ALTER TABLE public.clubs
  ADD CONSTRAINT clubs_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Self-service account deletion. SECURITY DEFINER so the function can
-- reach auth.users; the WHERE clause is hardcoded to auth.uid() so a
-- caller can only ever delete themselves. All other user data cascades
-- from auth.users → profiles → owned rows.
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
