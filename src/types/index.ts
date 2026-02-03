export type ReadingStatus = 'want_to_read' | 'currently_reading' | 'finished';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  isbn_10: string | null;
  isbn_13: string | null;
  open_library_id: string | null;
  title: string;
  subtitle: string | null;
  authors: string[];
  cover_url: string | null;
  description: string | null;
  page_count: number | null;
  publish_year: number | null;
  subjects: string[];
  created_at: string;
  updated_at: string;
}

export interface TbrCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserBookCategory {
  id: string;
  user_book_id: string;
  category_id: string;
  created_at: string;
  category?: TbrCategory;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  current_page: number;
  started_at: string | null;
  finished_at: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
  book?: Book;
  profile?: Profile;
  categories?: TbrCategory[];
}

export interface Note {
  id: string;
  user_id: string;
  user_book_id: string;
  page_number: number | null;
  chapter: string | null;
  title: string | null;
  content: string;
  is_summary: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_by: string;
  invite_code: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profile?: Profile;
}

export interface ClubBookSuggestion {
  id: string;
  club_id: string;
  book_id: string;
  suggested_by: string;
  note: string | null;
  created_at: string;
  book?: Book;
  profile?: Profile;
  vote_count?: number;
  user_has_voted?: boolean;
  comments?: SuggestionComment[];
}

export interface SuggestionVote {
  id: string;
  suggestion_id: string;
  user_id: string;
  created_at: string;
  profile?: Profile;
}

export interface SuggestionComment {
  id: string;
  suggestion_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

// Open Library API types
export interface OpenLibrarySearchResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  subject?: string[];
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibrarySearchResult[];
}
