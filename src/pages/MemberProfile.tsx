import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfile } from '@/api/profiles';
import { getUserBooks } from '@/api/userBooks';
import { getNotes } from '@/api/notes';
import type { Profile, UserBook, Book, Note } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { BookCard } from '@/components/books/BookCard';
import { Tabs } from '@/components/ui/Tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { NoteCard } from '@/components/notes/NoteCard';

type TabId = 'reading' | 'finished' | 'notes';

export function MemberProfile() {
  const { clubId, memberId } = useParams<{ clubId: string; memberId: string }>();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<(UserBook & { book: Book })[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('reading');

  useEffect(() => {
    if (memberId) {
      loadData();
    }
  }, [memberId]);

  const loadData = async () => {
    if (!memberId) return;
    try {
      const [profileData, booksData] = await Promise.all([
        getProfile(memberId),
        getUserBooks(memberId),
      ]);

      setProfile(profileData);
      setBooks(booksData as (UserBook & { book: Book })[]);

      // Load notes for all books
      const allNotes: Note[] = [];
      for (const userBook of booksData) {
        const bookNotes = await getNotes(userBook.id);
        allNotes.push(...bookNotes.filter((n) => !n.is_private));
      }
      setNotes(allNotes);
    } catch (error) {
      console.error('Failed to load member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentlyReading = books.filter((b) => b.status === 'currently_reading');
  const finished = books.filter((b) => b.status === 'finished');

  const tabs = [
    { id: 'reading' as const, label: 'Currently Reading', count: currentlyReading.length },
    { id: 'finished' as const, label: 'Finished', count: finished.length },
    { id: 'notes' as const, label: 'Notes', count: notes.length },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Member not found</h2>
        <Link to={`/club/${clubId}`} className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Back to club
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to={`/club/${clubId}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to club
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatar_url}
            name={profile.display_name || profile.username}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-gray-500">@{profile.username}</p>
            {profile.bio && <p className="text-gray-600 mt-2">{profile.bio}</p>}
          </div>
        </div>

        <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{books.length}</p>
            <p className="text-sm text-gray-500">Books</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{finished.length}</p>
            <p className="text-sm text-gray-500">Finished</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
            <p className="text-sm text-gray-500">Notes</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabId)} />

        <div className="mt-6">
          {activeTab === 'reading' && (
            currentlyReading.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentlyReading.map((userBook) => (
                  <BookCard
                    key={userBook.id}
                    book={userBook.book}
                    userBook={userBook}
                    showProgress
                    showStatus={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Not reading anything"
                description="This member isn't currently reading any books."
              />
            )
          )}

          {activeTab === 'finished' && (
            finished.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {finished.map((userBook) => (
                  <BookCard
                    key={userBook.id}
                    book={userBook.book}
                    userBook={userBook}
                    showStatus={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No finished books"
                description="This member hasn't finished any books yet."
              />
            )
          )}

          {activeTab === 'notes' && (
            notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No shared notes"
                description="This member hasn't shared any notes."
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
