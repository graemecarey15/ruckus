import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BookCover } from '@/components/books/BookCover';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { searchBooks, transformToBook } from '@/api/openLibrary';
import { getOrCreateBook } from '@/api/books';
import { suggestBook } from '@/api/clubs';
import type { OpenLibrarySearchResult, UserBook, Book, ClubBookSuggestion } from '@/types';

interface SuggestBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  userId: string;
  userBooks: (UserBook & { book: Book })[];
  existingSuggestions: ClubBookSuggestion[];
  onSuggestionAdded: (suggestion: ClubBookSuggestion) => void;
}

type Tab = 'search' | 'library';

export function SuggestBookModal({
  isOpen,
  onClose,
  clubId,
  userId,
  userBooks,
  existingSuggestions,
  onSuggestionAdded,
}: SuggestBookModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OpenLibrarySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [suggesting, setSuggesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestedBookIds = new Set(existingSuggestions.map((s) => s.book_id));
  const wantToReadBooks = userBooks.filter((ub) => ub.status === 'want_to_read');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    try {
      const response = await searchBooks(query);
      setSearchResults(response.docs);
    } catch (err) {
      setError('Failed to search books');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSuggestFromSearch = async (doc: OpenLibrarySearchResult) => {
    setSuggesting(doc.key);
    setError(null);
    try {
      const bookData = transformToBook(doc);
      const book = await getOrCreateBook(bookData);

      if (suggestedBookIds.has(book.id)) {
        setError('This book has already been suggested');
        setSuggesting(null);
        return;
      }

      const suggestion = await suggestBook(clubId, book.id, userId);
      onSuggestionAdded(suggestion);
      onClose();
    } catch (err) {
      setError('Failed to suggest book');
      console.error(err);
    } finally {
      setSuggesting(null);
    }
  };

  const handleSuggestFromLibrary = async (bookId: string) => {
    setSuggesting(bookId);
    setError(null);
    try {
      if (suggestedBookIds.has(bookId)) {
        setError('This book has already been suggested');
        setSuggesting(null);
        return;
      }

      const suggestion = await suggestBook(clubId, bookId, userId);
      onSuggestionAdded(suggestion);
      onClose();
    } catch (err) {
      setError('Failed to suggest book');
      console.error(err);
    } finally {
      setSuggesting(null);
    }
  };

  const handleClose = () => {
    setQuery('');
    setSearchResults([]);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Suggest a Book">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'search'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'library'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Library ({wantToReadBooks.length})
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a book..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <Button type="submit" size="sm" disabled={searching}>
                {searching ? <LoadingSpinner size="sm" /> : 'Search'}
              </Button>
            </form>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchResults.map((doc) => (
                <div
                  key={doc.key}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <BookCover
                    src={doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg` : null}
                    title={doc.title}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {doc.author_name?.join(', ') || 'Unknown author'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSuggestFromSearch(doc)}
                    disabled={suggesting === doc.key}
                  >
                    {suggesting === doc.key ? <LoadingSpinner size="sm" /> : 'Suggest'}
                  </Button>
                </div>
              ))}
              {searchResults.length === 0 && !searching && query && (
                <p className="text-sm text-gray-500 text-center py-4">No results found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="max-h-72 overflow-y-auto space-y-2">
            {wantToReadBooks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No books in your "Want to Read" list
              </p>
            ) : (
              wantToReadBooks.map((ub) => {
                const alreadySuggested = suggestedBookIds.has(ub.book_id);
                return (
                  <div
                    key={ub.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <BookCover
                      src={ub.book?.cover_url}
                      title={ub.book?.title || 'Book'}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ub.book?.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {ub.book?.authors.join(', ')}
                      </p>
                    </div>
                    {alreadySuggested ? (
                      <span className="text-xs text-gray-400">Already suggested</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSuggestFromLibrary(ub.book_id)}
                        disabled={suggesting === ub.book_id}
                      >
                        {suggesting === ub.book_id ? <LoadingSpinner size="sm" /> : 'Suggest'}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
