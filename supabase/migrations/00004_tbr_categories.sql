-- ============================================
-- TBR (To Be Read) CATEGORIES
-- ============================================

-- Categories/shelves for organizing TBR books
CREATE TABLE public.tbr_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Junction table for book-category relationships (many-to-many)
CREATE TABLE public.user_book_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_book_id UUID NOT NULL REFERENCES public.user_books(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.tbr_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_book_id, category_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_tbr_categories_user ON public.tbr_categories(user_id);
CREATE INDEX idx_tbr_categories_sort ON public.tbr_categories(user_id, sort_order);
CREATE INDEX idx_user_book_categories_user_book ON public.user_book_categories(user_book_id);
CREATE INDEX idx_user_book_categories_category ON public.user_book_categories(category_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.tbr_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_book_categories ENABLE ROW LEVEL SECURITY;

-- TBR Categories: Users can only manage their own categories
CREATE POLICY "Users can view own categories"
  ON public.tbr_categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON public.tbr_categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.tbr_categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.tbr_categories FOR DELETE USING (auth.uid() = user_id);

-- User Book Categories: Users can manage categories for their own books
CREATE POLICY "Users can view own book categories"
  ON public.user_book_categories FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_books ub
      WHERE ub.id = user_book_categories.user_book_id
        AND ub.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add categories to own books"
  ON public.user_book_categories FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_books ub
      WHERE ub.id = user_book_categories.user_book_id
        AND ub.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove categories from own books"
  ON public.user_book_categories FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_books ub
      WHERE ub.id = user_book_categories.user_book_id
        AND ub.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_tbr_categories_updated_at
  BEFORE UPDATE ON public.tbr_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
