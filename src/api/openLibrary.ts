import type { OpenLibrarySearchResponse, OpenLibrarySearchResult, Book } from '@/types';
import { searchGoogleBooks } from './googleBooks';

const BASE_URL = 'https://openlibrary.org';
const COVERS_URL = 'https://covers.openlibrary.org';

async function searchOpenLibrary(query: string): Promise<OpenLibrarySearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: '50',
    fields: 'key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median,subject',
  });

  const response = await fetch(`${BASE_URL}/search.json?${params}`);
  if (!response.ok) {
    return [];
  }
  const data: OpenLibrarySearchResponse = await response.json();
  return data.docs.map((doc) => ({ ...doc, source: 'openlibrary' as const }));
}

function deduplicateResults(results: OpenLibrarySearchResult[]): OpenLibrarySearchResult[] {
  const seen = new Map<string, OpenLibrarySearchResult>();

  for (const result of results) {
    // Build a dedup key from normalized title + first author
    const title = result.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const author = (result.author_name?.[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `${title}|${author}`;

    if (!seen.has(key)) {
      seen.set(key, result);
    }
  }

  return Array.from(seen.values());
}

function filterByRelevance(results: OpenLibrarySearchResult[], query: string): OpenLibrarySearchResult[] {
  const queryLower = query.toLowerCase().trim();
  // Extract meaningful words (skip short common words)
  const stopWords = new Set(['the', 'a', 'an', 'of', 'and', 'in', 'on', 'at', 'to', 'for', 'by', 'is', 'it']);
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 1 && !stopWords.has(w));
  if (queryWords.length === 0) return results;

  return results.filter((result) => {
    const title = result.title.toLowerCase();
    const authors = (result.author_name || []).join(' ').toLowerCase();
    const text = `${title} ${authors}`;
    // Result must contain at least one meaningful query word
    return queryWords.some((word) => text.includes(word));
  });
}

function rankResults(results: OpenLibrarySearchResult[], query: string): OpenLibrarySearchResult[] {
  const queryLower = query.toLowerCase().trim();

  return results.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const aExact = aTitle === queryLower;
    const bExact = bTitle === queryLower;
    const aStarts = aTitle.startsWith(queryLower);
    const bStarts = bTitle.startsWith(queryLower);

    if (aExact && !bExact) return -1;
    if (bExact && !aExact) return 1;
    if (aStarts && !bStarts) return -1;
    if (bStarts && !aStarts) return 1;
    return 0;
  });
}

export async function searchBooks(query: string): Promise<OpenLibrarySearchResponse> {
  const [olResults, gbResults] = await Promise.all([
    searchOpenLibrary(query),
    searchGoogleBooks(query),
  ]);

  // Filter irrelevant results, rank each source, then interleave
  const rankedOL = rankResults(filterByRelevance(olResults, query), query);
  const rankedGB = rankResults(filterByRelevance(gbResults, query), query);

  const interleaved: OpenLibrarySearchResult[] = [];
  const maxLen = Math.max(rankedOL.length, rankedGB.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < rankedOL.length) interleaved.push(rankedOL[i]);
    if (i < rankedGB.length) interleaved.push(rankedGB[i]);
  }

  const deduped = deduplicateResults(interleaved).slice(0, 20);
  return { numFound: deduped.length, docs: deduped };
}

export async function searchByISBN(isbn: string): Promise<OpenLibrarySearchResponse> {
  const response = await fetch(`${BASE_URL}/search.json?isbn=${isbn}&limit=1`);
  if (!response.ok) {
    throw new Error('Failed to search by ISBN');
  }
  return response.json();
}

export function getCoverUrl(
  identifier: string,
  type: 'isbn' | 'olid' | 'id' = 'isbn',
  size: 'S' | 'M' | 'L' = 'M'
): string {
  return `${COVERS_URL}/b/${type}/${identifier}-${size}.jpg`;
}

export function transformToBook(doc: OpenLibrarySearchResult): Omit<Book, 'id' | 'created_at' | 'updated_at'> {
  const isbn13 = doc.isbn?.find((i) => i.length === 13) || null;
  const isbn10 = doc.isbn?.find((i) => i.length === 10) || null;

  const coverUrl = doc.cover_i
    ? getCoverUrl(String(doc.cover_i), 'id', 'M')
    : doc.cover_url || null;

  const openLibraryId = doc.key.startsWith('/works/')
    ? doc.key.replace('/works/', '')
    : null;

  return {
    title: doc.title,
    subtitle: null,
    authors: doc.author_name || ['Unknown'],
    isbn_13: isbn13,
    isbn_10: isbn10,
    open_library_id: openLibraryId,
    cover_url: coverUrl,
    description: null,
    page_count: doc.number_of_pages_median || null,
    publish_year: doc.first_publish_year || null,
    subjects: doc.subject?.slice(0, 5) || [],
  };
}
