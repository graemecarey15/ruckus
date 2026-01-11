import type { OpenLibrarySearchResponse, OpenLibrarySearchResult, Book } from '@/types';

const BASE_URL = 'https://openlibrary.org';
const COVERS_URL = 'https://covers.openlibrary.org';

export async function searchBooks(query: string): Promise<OpenLibrarySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: '20',
    fields: 'key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median,subject',
  });

  const response = await fetch(`${BASE_URL}/search.json?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search books');
  }
  return response.json();
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

  return {
    title: doc.title,
    subtitle: null,
    authors: doc.author_name || ['Unknown'],
    isbn_13: isbn13,
    isbn_10: isbn10,
    open_library_id: doc.key.replace('/works/', ''),
    cover_url: doc.cover_i ? getCoverUrl(String(doc.cover_i), 'id', 'M') : null,
    description: null,
    page_count: doc.number_of_pages_median || null,
    publish_year: doc.first_publish_year || null,
    subjects: doc.subject?.slice(0, 5) || [],
  };
}
