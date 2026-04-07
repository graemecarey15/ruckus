import type { OpenLibrarySearchResult } from '@/types';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publishedDate?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

export async function searchGoogleBooks(query: string): Promise<OpenLibrarySearchResult[]> {
  // Use intitle: with quotes for exact phrase matching on the title
  const params = new URLSearchParams({
    q: `intitle:"${query}"`,
    maxResults: '20',
  });

  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  if (apiKey) {
    params.set('key', apiKey);
  }

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) {
    return [];
  }

  const data: GoogleBooksResponse = await response.json();
  if (!data.items) return [];

  return data.items.map((item) => toSearchResult(item));
}

export interface BookSuggestion {
  title: string;
  author: string;
  year?: number;
  coverUrl?: string;
}

export async function suggestBooks(query: string): Promise<BookSuggestion[]> {
  const params = new URLSearchParams({
    q: `intitle:"${query}"`,
    maxResults: '5',
    fields: 'items(volumeInfo(title,authors,publishedDate,imageLinks/smallThumbnail))',
  });

  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  if (apiKey) {
    params.set('key', apiKey);
  }

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) return [];

  const data: GoogleBooksResponse = await response.json();
  if (!data.items) return [];

  const seen = new Set<string>();
  const suggestions: BookSuggestion[] = [];

  for (const item of data.items) {
    const vi = item.volumeInfo;
    const key = `${vi.title.toLowerCase()}|${(vi.authors?.[0] || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const year = vi.publishedDate ? parseInt(vi.publishedDate.slice(0, 4), 10) : undefined;
    let coverUrl: string | undefined;
    if (vi.imageLinks?.smallThumbnail) {
      coverUrl = vi.imageLinks.smallThumbnail.replace('http://', 'https://');
    }

    suggestions.push({
      title: vi.title,
      author: vi.authors?.join(', ') || 'Unknown author',
      year: Number.isNaN(year!) ? undefined : year,
      coverUrl,
    });
  }

  return suggestions;
}

function toSearchResult(volume: GoogleBooksVolume): OpenLibrarySearchResult {
  const vi = volume.volumeInfo;
  const isbns = vi.industryIdentifiers?.map((id) => id.identifier) ?? [];
  const year = vi.publishedDate ? parseInt(vi.publishedDate.slice(0, 4), 10) : undefined;

  // Google serves http thumbnails — upgrade to https and remove curl/zoom params for better quality
  let coverUrl: string | undefined;
  if (vi.imageLinks?.thumbnail) {
    coverUrl = vi.imageLinks.thumbnail
      .replace('http://', 'https://')
      .replace('&edge=curl', '');
  }

  return {
    key: `/google/${volume.id}`,
    title: vi.title,
    author_name: vi.authors,
    first_publish_year: Number.isNaN(year!) ? undefined : year,
    isbn: isbns.length > 0 ? isbns : undefined,
    number_of_pages_median: vi.pageCount,
    subject: vi.categories,
    cover_url: coverUrl,
    source: 'google',
  };
}
