import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { OpenLibrarySearchResult, ReadingStatus } from '@/types';
import { BookCover } from './BookCover';
import { Button } from '@/components/ui/Button';
import { getCoverUrl, transformToBook } from '@/api/openLibrary';
import { getOrCreateBook } from '@/api/books';
import { addBookToLibrary, getUserBook } from '@/api/userBooks';
import { useAuth } from '@/contexts/AuthContext';

interface BookSearchCardProps {
  result: OpenLibrarySearchResult;
  onAdded?: () => void;
}

export function BookSearchCard({ result, onAdded }: BookSearchCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [addedStatus, setAddedStatus] = useState<ReadingStatus | null>(null);
  const [error, setError] = useState('');

  const coverUrl = result.cover_i
    ? getCoverUrl(String(result.cover_i), 'id', 'M')
    : null;

  const handleAdd = async (status: ReadingStatus) => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const bookData = transformToBook(result);
      const book = await getOrCreateBook(bookData);

      // Check if already in library
      const existing = await getUserBook(user.id, book.id);
      if (existing) {
        setError('Already in your library');
        setLoading(false);
        return;
      }

      await addBookToLibrary(user.id, book.id, status);
      setAddedStatus(status);
      onAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex gap-4">
        <BookCover src={coverUrl} title={result.title} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{result.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {result.author_name?.join(', ') || 'Unknown author'}
          </p>
          {result.first_publish_year && (
            <p className="text-xs text-gray-500 mt-1">{result.first_publish_year}</p>
          )}

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          {addedStatus ? (
            <div className="mt-3">
              <p className="text-sm text-green-600 font-medium">Added to library!</p>
              {addedStatus === 'want_to_read' && (
                <Link
                  to="/library?tab=want_to_read"
                  className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Go to TBR →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => handleAdd('want_to_read')}
                disabled={loading}
              >
                TBR
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAdd('currently_reading')}
                disabled={loading}
              >
                Start Reading
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
