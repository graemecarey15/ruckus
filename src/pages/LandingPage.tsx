import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBooks } from '@/api/userBooks';
import { getUserClubs } from '@/api/clubs';
import type { UserBook, Book, Club } from '@/types';
import { BookCover } from '@/components/books/BookCover';
import { ProgressBar } from '@/components/books/ProgressBar';

export function LandingPage() {
  const { user } = useAuth();
  const [currentBook, setCurrentBook] = useState<(UserBook & { book: Book }) | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      const [booksData, clubsData] = await Promise.all([
        getUserBooks(user.id),
        getUserClubs(user.id),
      ]);
      const reading = booksData.find((b) => b.status === 'currently_reading');
      if (reading) setCurrentBook(reading as UserBook & { book: Book });
      setClubs(clubsData);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Track your reading journey
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        Share what you're reading with friends and family. Keep notes, track progress, and discover new books together.
      </p>
      <div className="flex space-x-4">
        {user ? (
          <>
            <Link
              to="/library"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Go to My Library
            </Link>
            <Link
              to="/clubs"
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50"
            >
              Go to Clubs
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/auth"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Get Started
            </Link>
            <Link
              to="/auth"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      {user && (currentBook || clubs.length > 0) && (
        <div className="mt-10 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-3 text-left">Your Clubs</h3>
              <div className="space-y-2">
                {clubs.slice(0, 3).map((club) => (
                  <Link
                    key={club.id}
                    to={`/club/${club.id}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {club.cover_image_url ? (
                      <img src={club.cover_image_url} alt={club.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <span className="text-lg">📚</span>
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{club.name}</span>
                  </Link>
                ))}
                {clubs.length > 3 && (
                  <p className="text-sm text-gray-500 text-left pl-2">+{clubs.length - 3} more</p>
                )}
              </div>
            </div>
          )}

          {currentBook && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-3 text-left">Currently Reading</h3>
              <Link to={`/book/${currentBook.book_id}`} className="flex gap-4 items-start text-left hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors">
                <BookCover src={currentBook.book.cover_url} title={currentBook.book.title} size="sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">{currentBook.book.title}</h4>
                  <p className="text-sm text-gray-500">{currentBook.book.authors?.join(', ')}</p>
                  {currentBook.book.page_count && (
                    <div className="mt-2">
                      <ProgressBar current={currentBook.current_page} total={currentBook.book.page_count} />
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>
      )}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="p-6">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-semibold text-gray-900 mb-2">Track Your Books</h3>
          <p className="text-gray-600 text-sm">
            Keep a catalog of what you're reading, want to read, and have finished.
          </p>
        </div>
        <div className="p-6">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="font-semibold text-gray-900 mb-2">Take Notes</h3>
          <p className="text-gray-600 text-sm">
            Capture your thoughts, favorite quotes, and chapter summaries.
          </p>
        </div>
        <div className="p-6">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-gray-900 mb-2">Share with Others</h3>
          <p className="text-gray-600 text-sm">
            Create book clubs and see what your friends are reading.
          </p>
        </div>
      </div>
    </div>
  );
}
