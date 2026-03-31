import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBooks } from '@/api/userBooks';
import { getUserNotes } from '@/api/notes';
import { getUserTbrCategories } from '@/api/tbrCategories';
import type { UserBook, Book, Note, TbrCategory } from '@/types';
import { Tabs } from '@/components/ui/Tabs';
import { BookGrid } from '@/components/books/BookGrid';
import { BookCover } from '@/components/books/BookCover';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { CategoryFilter, type CategoryFilterValue } from '@/components/tbr/CategoryFilter';
import { ManageCategoriesModal } from '@/components/tbr/ManageCategoriesModal';

type NoteWithBook = Note & { user_book: { book: { id: string; title: string; cover_url: string | null } } };
type TabId = 'currently_reading' | 'want_to_read' | 'finished' | 'notes';

export function MyLibrary() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<(UserBook & { book: Book })[]>([]);
  const [notes, setNotes] = useState<NoteWithBook[]>([]);
  const [categories, setCategories] = useState<TbrCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const tabParam = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && ['currently_reading', 'want_to_read', 'finished', 'notes'].includes(tabParam)
      ? tabParam
      : 'currently_reading'
  );
  const [visibleNotes, setVisibleNotes] = useState(10);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterValue>('all');
  const [showManageModal, setShowManageModal] = useState(false);

  const loadBooks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserBooks(user.id);
      setBooks(data as (UserBook & { book: Book })[]);
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  }, [user]);

  const loadNotes = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserNotes(user.id);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, [user]);

  const loadCategories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserTbrCategories(user.id);
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      Promise.all([loadBooks(), loadCategories(), loadNotes()]).finally(() => setLoading(false));
    }
  }, [user, loadBooks, loadCategories, loadNotes]);

  const handleCategoriesChange = () => {
    loadCategories();
    loadBooks();
  };

  const handleBookCategoriesChange = (userBookId: string, newCategories: TbrCategory[]) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === userBookId ? { ...book, categories: newCategories } : book
      )
    );
  };

  // Filter by tab status
  const tabFilteredBooks = books.filter((b) => b.status === activeTab);

  // Apply category filter for TBR tab
  const filteredBooks =
    activeTab === 'want_to_read'
      ? tabFilteredBooks.filter((book) => {
          if (selectedCategory === 'all') return true;
          if (selectedCategory === 'uncategorized') {
            return !book.categories || book.categories.length === 0;
          }
          return book.categories?.some((c) => c.id === selectedCategory);
        })
      : tabFilteredBooks;

  const tabs = [
    {
      id: 'currently_reading' as const,
      label: 'Reading',
      count: books.filter((b) => b.status === 'currently_reading').length,
    },
    {
      id: 'want_to_read' as const,
      label: 'TBR',
      count: books.filter((b) => b.status === 'want_to_read').length,
    },
    {
      id: 'finished' as const,
      label: 'Finished',
      count: books.filter((b) => b.status === 'finished').length,
    },
    {
      id: 'notes' as const,
      label: 'Notes',
      count: notes.length,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
        <Link to="/search">
          <Button>Add Books</Button>
        </Link>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => {
          setActiveTab(id as TabId);
          setSelectedCategory('all');
          setSearchParams({ tab: id });
        }}
      />

      {activeTab === 'want_to_read' && (
        <div className="mt-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onManageClick={() => setShowManageModal(true)}
          />
        </div>
      )}

      <div className="mt-6">
        {activeTab === 'notes' ? (
          notes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">You haven't written any notes yet.</p>
          ) : (
            <div className="space-y-4">
              {notes.slice(0, visibleNotes).map((note) => {
                const isExpanded = expandedNotes.has(note.id);
                return (
                  <Link
                    key={note.id}
                    to={`/book/${note.user_book?.book?.id}`}
                    className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex gap-4">
                      <BookCover src={note.user_book?.book?.cover_url} title={note.user_book?.book?.title || 'Book'} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {note.user_book?.book?.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
                          {note.page_number && <span>Page {note.page_number}</span>}
                          {note.chapter && <span>Ch. {note.chapter}</span>}
                        </div>
                        {note.title && (
                          <h4 className="text-sm font-medium text-gray-800 mb-1">{note.title}</h4>
                        )}
                        <p className={`text-sm text-gray-700 whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}>{note.content}</p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setExpandedNotes((prev) => {
                              const next = new Set(prev);
                              if (next.has(note.id)) {
                                next.delete(note.id);
                              } else {
                                next.add(note.id);
                              }
                              return next;
                            });
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 mt-1"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                        <div className="flex gap-2 mt-1">
                          {note.is_summary && (
                            <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Summary</span>
                          )}
                          {note.is_private && (
                            <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Private</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {notes.length > visibleNotes && (
                <button
                  onClick={() => setVisibleNotes((prev) => prev + 10)}
                  className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Load more notes ({notes.length - visibleNotes} remaining)
                </button>
              )}
            </div>
          )
        ) : (
          <BookGrid
            books={filteredBooks}
            showProgress={activeTab === 'currently_reading'}
            showCategorySelector={activeTab === 'want_to_read'}
            allCategories={categories}
            onBookCategoriesChange={handleBookCategoriesChange}
            emptyMessage={
              activeTab === 'currently_reading'
                ? "You're not reading any books right now."
                : activeTab === 'want_to_read'
                  ? selectedCategory === 'uncategorized'
                    ? 'All your TBR books have categories.'
                    : selectedCategory !== 'all'
                      ? 'No books in this category.'
                      : "You haven't added any books to your TBR list."
                  : "You haven't finished any books yet."
            }
          />
        )}
      </div>

      {user && (
        <ManageCategoriesModal
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          categories={categories}
          userId={user.id}
          onCategoriesChange={handleCategoriesChange}
        />
      )}
    </div>
  );
}
