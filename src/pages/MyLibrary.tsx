import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBooks } from '@/api/userBooks';
import { getUserTbrCategories } from '@/api/tbrCategories';
import type { UserBook, Book, TbrCategory } from '@/types';
import { Tabs } from '@/components/ui/Tabs';
import { BookGrid } from '@/components/books/BookGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { CategoryFilter, type CategoryFilterValue } from '@/components/tbr/CategoryFilter';
import { ManageCategoriesModal } from '@/components/tbr/ManageCategoriesModal';

type TabId = 'currently_reading' | 'want_to_read' | 'finished';

export function MyLibrary() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<(UserBook & { book: Book })[]>([]);
  const [categories, setCategories] = useState<TbrCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const tabParam = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && ['currently_reading', 'want_to_read', 'finished'].includes(tabParam)
      ? tabParam
      : 'currently_reading'
  );
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
      Promise.all([loadBooks(), loadCategories()]).finally(() => setLoading(false));
    }
  }, [user, loadBooks, loadCategories]);

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
