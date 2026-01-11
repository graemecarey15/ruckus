import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBooks } from '@/api/userBooks';
import { getUserClubs } from '@/api/clubs';
import type { UserBook, Book, Club } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CurrentlyReading } from '@/components/dashboard/CurrentlyReading';
import { ClubsOverview } from '@/components/dashboard/ClubsOverview';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [books, setBooks] = useState<(UserBook & { book: Book })[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [booksData, clubsData] = await Promise.all([
        getUserBooks(user.id),
        getUserClubs(user.id),
      ]);
      setBooks(booksData as (UserBook & { book: Book })[]);
      setClubs(clubsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentlyReading = books.filter((b) => b.status === 'currently_reading');
  const finishedCount = books.filter((b) => b.status === 'finished').length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">
          {finishedCount > 0
            ? `You've finished ${finishedCount} book${finishedCount !== 1 ? 's' : ''} so far.`
            : 'Start your reading journey today.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentlyReading books={currentlyReading} />
        <ClubsOverview clubs={clubs} />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-indigo-600">{books.length}</p>
          <p className="text-sm text-gray-500 mt-1">Books in Library</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{currentlyReading.length}</p>
          <p className="text-sm text-gray-500 mt-1">Currently Reading</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{clubs.length}</p>
          <p className="text-sm text-gray-500 mt-1">Book Clubs</p>
        </div>
      </div>
    </div>
  );
}
