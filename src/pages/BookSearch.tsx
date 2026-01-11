import { useState } from 'react';
import { searchBooks } from '@/api/openLibrary';
import type { OpenLibrarySearchResult } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BookSearchCard } from '@/components/books/BookSearchCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

export function BookSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OpenLibrarySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await searchBooks(query);
      setResults(response.docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Books</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading || !query.trim()}>
          Search
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <EmptyState
          title="No books found"
          description="Try a different search term or check your spelling."
        />
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result) => (
            <BookSearchCard key={result.key} result={result} />
          ))}
        </div>
      )}

      {!searched && !loading && (
        <EmptyState
          title="Search for books"
          description="Enter a title, author name, or ISBN to find books to add to your library."
        />
      )}
    </div>
  );
}
