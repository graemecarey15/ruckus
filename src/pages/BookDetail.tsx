import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getBook } from '@/api/books';
import { getUserBook, updateReadingStatus, updateProgress, removeFromLibrary } from '@/api/userBooks';
import { getNotes, createNote, updateNote, deleteNote } from '@/api/notes';
import type { Book, UserBook, Note, ReadingStatus } from '@/types';
import { BookCover } from '@/components/books/BookCover';
import { StatusSelector } from '@/components/books/StatusSelector';
import { ProgressTracker } from '@/components/books/ProgressTracker';
import { NotesList } from '@/components/notes/NotesList';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    if (id && user) {
      loadData();
    }
  }, [id, user]);

  const loadData = async () => {
    if (!id || !user) return;

    try {
      const [bookData, userBookData] = await Promise.all([
        getBook(id),
        getUserBook(user.id, id),
      ]);

      setBook(bookData);
      setUserBook(userBookData);

      if (userBookData) {
        const notesData = await getNotes(userBookData.id);
        setNotes(notesData);
      }
    } catch (error) {
      console.error('Failed to load book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: ReadingStatus) => {
    if (!userBook) return;
    const updated = await updateReadingStatus(userBook.id, status);
    setUserBook(updated);
  };

  const handleProgressUpdate = async (page: number) => {
    if (!userBook) return;
    const updated = await updateProgress(userBook.id, page);
    setUserBook(updated);
  };

  const handleRemoveBook = async () => {
    if (!userBook) return;
    if (!confirm('Remove this book from your library?')) return;

    await removeFromLibrary(userBook.id);
    navigate('/library');
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    if (!userBook || !user) return;

    if (editingNote) {
      const updated = await updateNote(editingNote.id, noteData);
      setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
      setEditingNote(null);
    } else {
      const newNote = await createNote({
        user_id: user.id,
        user_book_id: userBook.id,
        content: noteData.content || '',
        title: noteData.title || null,
        page_number: noteData.page_number || null,
        chapter: noteData.chapter || null,
        is_summary: noteData.is_summary || false,
        is_private: noteData.is_private || false,
      });
      setNotes([newNote, ...notes]);
    }
    setShowNoteEditor(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    await deleteNote(noteId);
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Book not found</h2>
        <Link to="/library" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/library"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to library
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <BookCover src={book.cover_url} title={book.title} size="lg" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
            {book.subtitle && (
              <p className="text-lg text-gray-600 mt-1">{book.subtitle}</p>
            )}
            <p className="text-gray-600 mt-2">{book.authors.join(', ')}</p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              {book.publish_year && <span>Published: {book.publish_year}</span>}
              {book.page_count && <span>{book.page_count} pages</span>}
            </div>

            {book.description && (
              <p className="text-gray-700 mt-4 line-clamp-4">{book.description}</p>
            )}

            {userBook && (
              <div className="mt-6 flex items-center gap-4">
                <StatusSelector status={userBook.status} onChange={handleStatusChange} />
                <Button variant="ghost" size="sm" onClick={handleRemoveBook}>
                  Remove from library
                </Button>
              </div>
            )}
          </div>
        </div>

        {userBook && userBook.status === 'currently_reading' && book.page_count && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <ProgressTracker
              currentPage={userBook.current_page}
              totalPages={book.page_count}
              onUpdate={handleProgressUpdate}
            />
          </div>
        )}
      </div>

      {userBook && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingNote(null);
                setShowNoteEditor(true);
              }}
            >
              Add Note
            </Button>
          </div>

          {(showNoteEditor || editingNote) && (
            <div className="mb-6">
              <NoteEditor
                note={editingNote}
                onSave={handleSaveNote}
                onCancel={() => {
                  setShowNoteEditor(false);
                  setEditingNote(null);
                }}
              />
            </div>
          )}

          <NotesList
            notes={notes}
            onEdit={(note) => {
              setEditingNote(note);
              setShowNoteEditor(false);
            }}
            onDelete={handleDeleteNote}
          />
        </div>
      )}
    </div>
  );
}
