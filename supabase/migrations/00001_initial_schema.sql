-- ============================================
-- USERS & PROFILES
-- ============================================

-- Extends Supabase auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKS (cached metadata from external API)
-- ============================================

CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn_10 TEXT,
  isbn_13 TEXT,
  open_library_id TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  authors TEXT[] NOT NULL DEFAULT '{}',
  cover_url TEXT,
  description TEXT,
  page_count INTEGER,
  publish_year INTEGER,
  subjects TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(isbn_13),
  UNIQUE(open_library_id)
);

-- ============================================
-- USER BOOKS (reading catalog)
-- ============================================

CREATE TYPE reading_status AS ENUM ('want_to_read', 'currently_reading', 'finished');

CREATE TABLE public.user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  status reading_status NOT NULL DEFAULT 'want_to_read',
  current_page INTEGER DEFAULT 0,
  started_at DATE,
  finished_at DATE,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- ============================================
-- NOTES (book-level and chapter/page-level)
-- ============================================

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_book_id UUID NOT NULL REFERENCES public.user_books(id) ON DELETE CASCADE,
  page_number INTEGER,
  chapter TEXT,
  title TEXT,
  content TEXT NOT NULL,
  is_summary BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOK CLUBS / GROUPS
-- ============================================

CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_books_user_id ON public.user_books(user_id);
CREATE INDEX idx_user_books_status ON public.user_books(user_id, status);
CREATE INDEX idx_notes_user_book ON public.notes(user_book_id);
CREATE INDEX idx_club_members_club ON public.club_members(club_id);
CREATE INDEX idx_club_members_user ON public.club_members(user_id);
CREATE INDEX idx_books_isbn ON public.books(isbn_13);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Books: Anyone can read, authenticated users can insert
CREATE POLICY "Books are viewable by everyone"
  ON public.books FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update books"
  ON public.books FOR UPDATE USING (auth.role() = 'authenticated');

-- User Books: Own books always visible, club members can see shared
CREATE POLICY "Users can manage own books"
  ON public.user_books FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Club members can view each others books"
  ON public.user_books FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_members cm1
      JOIN public.club_members cm2 ON cm1.club_id = cm2.club_id
      WHERE cm1.user_id = auth.uid()
        AND cm2.user_id = user_books.user_id
    )
  );

-- Notes: Own notes always visible, non-private notes visible to club members
CREATE POLICY "Users can manage own notes"
  ON public.notes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Club members can view shared notes"
  ON public.notes FOR SELECT USING (
    NOT is_private AND EXISTS (
      SELECT 1 FROM public.club_members cm1
      JOIN public.club_members cm2 ON cm1.club_id = cm2.club_id
      WHERE cm1.user_id = auth.uid()
        AND cm2.user_id = notes.user_id
    )
  );

-- Clubs: Members can view their clubs
CREATE POLICY "Club members can view club"
  ON public.clubs FOR SELECT USING (
    is_public OR EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_id = clubs.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create clubs"
  ON public.clubs FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Club owners can update club"
  ON public.clubs FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_id = clubs.id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- Club Members: Members can view other members
CREATE POLICY "Club members can view membership"
  ON public.club_members FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_members cm
      WHERE cm.club_id = club_members.club_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join clubs"
  ON public.club_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clubs"
  ON public.club_members FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_books_updated_at
  BEFORE UPDATE ON public.user_books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
