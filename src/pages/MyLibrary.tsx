import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBooks } from '@/api/userBooks';
import type { UserBook, Book } from '@/types';
import { Tabs } from '@/components/ui/Tabs';
import { BookGrid } from '@/components/books/BookGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

type TabId = 'currently_reading' | 'want_to_read' | 'finished';

export function MyLibrary() {
  const { user } = useAuth();
  const [books, setBooks] = useState<(UserBook & { book: Book })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('currently_reading');

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    if (!user) return;
    try {
      const data = await getUserBooks(user.id);
      setBooks(data as (UserBook & { book: Book })[]);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((b) => b.status === activeTab);

  const tabs = [
    {
      id: 'currently_reading' as const,
      label: 'Reading',
      count: books.filter((b) => b.status === 'currently_reading').length,
    },
    {
      id: 'want_to_read' as const,
      label: 'Want to Read',
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
        onChange={(id) => setActiveTab(id as TabId)}
      />

      <div className="mt-6">
        <BookGrid
          books={filteredBooks}
          showProgress={activeTab === 'currently_reading'}
          emptyMessage={
            activeTab === 'currently_reading'
              ? "You're not reading any books right now."
              : activeTab === 'want_to_read'
              ? "You haven't added any books to your reading list."
              : "You haven't finished any books yet."
          }
        />
      </div>
    </div>
  );
}
