import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClub, getClubMembers, leaveClub, removeMember, getClubSuggestions, removeSuggestion, getVotesForSuggestion, getCommentsForSuggestion } from '@/api/clubs';
import { getUserBooks, updateProgress, addBookToLibrary } from '@/api/userBooks';
import { getPublicNotesForUser, createNote, deleteNote } from '@/api/notes';
import type { Club, ClubMember, UserBook, Book, Note, ClubBookSuggestion, SuggestionVote, SuggestionComment } from '@/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MemberCard } from '@/components/clubs/MemberCard';
import { BookCover } from '@/components/books/BookCover';
import { ProgressBar } from '@/components/books/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { SuggestBookModal } from '@/components/clubs/SuggestBookModal';
import { SuggestionCard } from '@/components/clubs/SuggestionCard';

export function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [memberBooks, setMemberBooks] = useState<Map<string, (UserBook & { book: Book })[]>>(new Map());
  const [memberNotes, setMemberNotes] = useState<Map<string, (Note & { user_book: { book: { id: string; title: string; cover_url: string | null } } })[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [quickNoteFor, setQuickNoteFor] = useState<string | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');
  const [suggestions, setSuggestions] = useState<ClubBookSuggestion[]>([]);
  const [myBookIds, setMyBookIds] = useState<Set<string>>(new Set());
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestionVotes, setSuggestionVotes] = useState<Map<string, SuggestionVote[]>>(new Map());
  const [suggestionComments, setSuggestionComments] = useState<Map<string, SuggestionComment[]>>(new Map());

  useEffect(() => {
    if (id) {
      loadClub();
    }
  }, [id]);

  const loadClub = async () => {
    if (!id) return;
    try {
      const [clubData, membersData, suggestionsData] = await Promise.all([
        getClub(id),
        getClubMembers(id),
        getClubSuggestions(id),
      ]);
      setClub(clubData);
      setMembers(membersData);
      setSuggestions(suggestionsData);

      // Load votes and comments for all suggestions
      const votesMap = new Map<string, SuggestionVote[]>();
      const commentsMap = new Map<string, SuggestionComment[]>();
      await Promise.all(
        suggestionsData.map(async (suggestion) => {
          try {
            const [votes, comments] = await Promise.all([
              getVotesForSuggestion(suggestion.id),
              getCommentsForSuggestion(suggestion.id),
            ]);
            votesMap.set(suggestion.id, votes);
            commentsMap.set(suggestion.id, comments);
          } catch (e) {
            console.error('Failed to load data for suggestion:', suggestion.id, e);
          }
        })
      );
      setSuggestionVotes(votesMap);
      setSuggestionComments(commentsMap);

      // Load books and notes for all members
      const booksMap = new Map<string, (UserBook & { book: Book })[]>();
      const notesMap = new Map<string, (Note & { user_book: { book: { id: string; title: string; cover_url: string | null } } })[]>();
      await Promise.all(
        membersData.map(async (member) => {
          try {
            const [books, notes] = await Promise.all([
              getUserBooks(member.user_id),
              getPublicNotesForUser(member.user_id),
            ]);
            booksMap.set(member.user_id, books as (UserBook & { book: Book })[]);
            notesMap.set(member.user_id, notes);
          } catch (e) {
            console.error('Failed to load data for member:', member.user_id, e);
          }
        })
      );
      setMemberBooks(booksMap);
      setMemberNotes(notesMap);

      // Track user's own books to know what they already have
      if (user) {
        const myBooks = booksMap.get(user.id) || [];
        setMyBookIds(new Set(myBooks.map((b) => b.book_id)));
      }
    } catch (error) {
      console.error('Failed to load club:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMember = members.find((m) => m.user_id === user?.id);
  const isOwner = currentMember?.role === 'owner';

  const handleLeaveClub = async () => {
    if (!club || !user) return;
    if (isOwner) {
      alert('As the owner, you cannot leave. Transfer ownership first or delete the club.');
      return;
    }
    if (!confirm('Are you sure you want to leave this club?')) return;

    await leaveClub(club.id, user.id);
    navigate('/clubs');
  };

  const inviteLink = club ? `${window.location.origin}/join/${club.invite_code}` : '';

  const handleRemoveMember = async (memberId: string) => {
    if (!club) return;
    if (!confirm('Remove this member from the club?')) return;

    try {
      await removeMember(club.id, memberId);
      setMembers(members.filter((m) => m.user_id !== memberId));
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member');
    }
  };

  const copyInviteLink = () => {
    if (club) {
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied!');
    }
  };

  const handleProgressUpdate = async (userBookId: string, newPage: number, userId: string) => {
    try {
      await updateProgress(userBookId, newPage);
      // Update local state
      setMemberBooks((prev) => {
        const newMap = new Map(prev);
        const books = newMap.get(userId);
        if (books) {
          const updated = books.map((b) =>
            b.id === userBookId ? { ...b, current_page: newPage } : b
          );
          newMap.set(userId, updated);
        }
        return newMap;
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleQuickNote = async (userBookId: string) => {
    if (!user || !quickNoteText.trim()) return;
    try {
      await createNote({
        user_id: user.id,
        user_book_id: userBookId,
        content: quickNoteText.trim(),
        is_private: false,
        is_summary: false,
        page_number: null,
        chapter: null,
        title: null,
      });
      setQuickNoteFor(null);
      setQuickNoteText('');
      // Reload notes
      loadClub();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleDeleteNote = async (noteId: string, noteUserId: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote(noteId);
      // Update local state
      setMemberNotes((prev) => {
        const newMap = new Map(prev);
        const notes = newMap.get(noteUserId);
        if (notes) {
          newMap.set(noteUserId, notes.filter((n) => n.id !== noteId));
        }
        return newMap;
      });
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert('Failed to delete note');
    }
  };

  const handleAddToLibrary = async (bookId: string) => {
    if (!user) return;
    try {
      await addBookToLibrary(user.id, bookId, 'want_to_read');
      setMyBookIds((prev) => new Set(prev).add(bookId));
    } catch (err) {
      console.error('Failed to add book:', err);
      alert('Failed to add book to library');
    }
  };

  const handleSuggestionAdded = (suggestion: ClubBookSuggestion) => {
    setSuggestions((prev) => [suggestion, ...prev]);
    setSuggestionVotes((prev) => new Map(prev).set(suggestion.id, []));
    setSuggestionComments((prev) => new Map(prev).set(suggestion.id, []));
  };

  const handleRemoveSuggestion = async (suggestionId: string) => {
    try {
      await removeSuggestion(suggestionId);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      setSuggestionVotes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(suggestionId);
        return newMap;
      });
      setSuggestionComments((prev) => {
        const newMap = new Map(prev);
        newMap.delete(suggestionId);
        return newMap;
      });
    } catch (err) {
      console.error('Failed to remove suggestion:', err);
    }
  };

  const handleVoteChange = (suggestionId: string, votes: SuggestionVote[]) => {
    setSuggestionVotes((prev) => new Map(prev).set(suggestionId, votes));
  };

  const handleCommentsChange = (suggestionId: string, comments: SuggestionComment[]) => {
    setSuggestionComments((prev) => new Map(prev).set(suggestionId, comments));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Club not found</h2>
        <Link to="/clubs" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Back to clubs
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/clubs"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to clubs
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {club.cover_image_url ? (
              <img
                src={club.cover_image_url}
                alt={club.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
              {club.description && (
                <p className="text-gray-600 mt-1">{club.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {members.length} member{members.length !== 1 && 's'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowInviteCode(!showInviteCode)}>
              {showInviteCode ? 'Hide Code' : 'Invite'}
            </Button>
            {!isOwner && (
              <Button variant="ghost" size="sm" onClick={handleLeaveClub}>
                Leave
              </Button>
            )}
          </div>
        </div>

        {showInviteCode && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Share this link to invite others:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 bg-white px-3 py-2 rounded border border-gray-200 text-sm"
              />
              <Button size="sm" variant="secondary" onClick={copyInviteLink}>
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Currently Reading Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What We're Reading</h2>
        {(() => {
          const currentlyReading = members.flatMap((member) => {
            const books = memberBooks.get(member.user_id) || [];
            return books
              .filter((b) => b.status === 'currently_reading')
              .map((b) => ({ ...b, member }));
          });

          if (currentlyReading.length === 0) {
            return (
              <p className="text-gray-500 text-sm">No one is currently reading anything.</p>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentlyReading.map((item) => {
                const isOwn = item.member.user_id === user?.id;
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex gap-4">
                      <BookCover src={item.book.cover_url} title={item.book.title} size="sm" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{item.book.title}</h3>
                        <p className="text-xs text-gray-500">{item.book.authors.join(', ')}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar
                            src={item.member.profile?.avatar_url}
                            name={item.member.profile?.display_name || item.member.profile?.username || ''}
                            size="sm"
                          />
                          <span className="text-xs text-gray-600">
                            {item.member.profile?.display_name || item.member.profile?.username}
                          </span>
                          {isOwn && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">You</span>
                          )}
                        </div>
                        {item.book.page_count && (
                          <div className="mt-2">
                            <ProgressBar
                              current={item.current_page}
                              total={item.book.page_count}
                              showLabel={false}
                              interactive={isOwn}
                              onProgressChange={isOwn ? (page) => handleProgressUpdate(item.id, page, item.member.user_id) : undefined}
                            />
                          </div>
                        )}
                        {isOwn ? (
                          <div className="mt-2">
                            {quickNoteFor === item.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={quickNoteText}
                                  onChange={(e) => setQuickNoteText(e.target.value)}
                                  placeholder="Quick note..."
                                  className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleQuickNote(item.id);
                                    if (e.key === 'Escape') {
                                      setQuickNoteFor(null);
                                      setQuickNoteText('');
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleQuickNote(item.id)}
                                  className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                  Post
                                </button>
                                <button
                                  onClick={() => {
                                    setQuickNoteFor(null);
                                    setQuickNoteText('');
                                  }}
                                  className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setQuickNoteFor(item.id)}
                                className="text-xs text-indigo-600 hover:text-indigo-700"
                              >
                                + Add note
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2">
                            {!myBookIds.has(item.book_id) && (
                              <button
                                onClick={() => handleAddToLibrary(item.book_id)}
                                className="text-xs text-indigo-600 hover:text-indigo-700"
                              >
                                + Add to library
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Recently Finished Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Finished</h2>
        {(() => {
          const finished = members.flatMap((member) => {
            const books = memberBooks.get(member.user_id) || [];
            return books
              .filter((b) => b.status === 'finished')
              .map((b) => ({ ...b, member }));
          }).sort((a, b) => new Date(b.finished_at || 0).getTime() - new Date(a.finished_at || 0).getTime())
            .slice(0, 6);

          if (finished.length === 0) {
            return (
              <p className="text-gray-500 text-sm">No one has finished any books yet.</p>
            );
          }

          return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {finished.map((item) => {
                const isOwn = item.member.user_id === user?.id;
                const hasBook = myBookIds.has(item.book_id);
                return (
                  <div key={item.id} className="text-center group">
                    <div className="relative">
                      <BookCover src={item.book.cover_url} title={item.book.title} size="md" />
                      {!isOwn && !hasBook && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 rounded">
                          <button
                            onClick={() => handleAddToLibrary(item.book_id)}
                            className="text-xs text-white bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-700"
                          >
                            + Library
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-1">{item.book.title}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Avatar
                        src={item.member.profile?.avatar_url}
                        name={item.member.profile?.display_name || item.member.profile?.username || ''}
                        size="sm"
                      />
                      {item.rating && (
                        <span className="text-xs text-amber-500">{'★'.repeat(item.rating)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Recent Notes Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Notes</h2>
        {(() => {
          const allNotes = members.flatMap((member) => {
            const notes = memberNotes.get(member.user_id) || [];
            return notes.map((n) => ({ ...n, member }));
          }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);

          if (allNotes.length === 0) {
            return (
              <p className="text-gray-500 text-sm">No notes shared yet.</p>
            );
          }

          return (
            <div className="space-y-4">
              {allNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative group">
                  <div className="flex gap-4">
                    <BookCover src={note.user_book?.book?.cover_url} title={note.user_book?.book?.title || 'Book'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar
                          src={note.member.profile?.avatar_url}
                          name={note.member.profile?.display_name || note.member.profile?.username || ''}
                          size="sm"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {note.member.profile?.display_name || note.member.profile?.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        on <span className="font-medium">{note.user_book?.book?.title}</span>
                        {note.page_number && ` (p. ${note.page_number})`}
                        {note.chapter && ` - ${note.chapter}`}
                      </p>
                      {note.title && (
                        <h4 className="text-sm font-medium text-gray-800 mb-1">{note.title}</h4>
                      )}
                      <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{note.content}</p>
                      {note.is_summary && (
                        <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Summary</span>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteNote(note.id, note.member.user_id)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete note"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Suggested Books Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Suggested Group Reads</h2>
          <Button size="sm" onClick={() => setShowSuggestModal(true)}>
            + Suggest a Book
          </Button>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-gray-500 text-sm">No books suggested yet. Click "Suggest a Book" to recommend something for the group!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                userId={user?.id || ''}
                isOwner={isOwner}
                votes={suggestionVotes.get(suggestion.id) || []}
                comments={suggestionComments.get(suggestion.id) || []}
                hasBook={myBookIds.has(suggestion.book_id)}
                onAddToLibrary={handleAddToLibrary}
                onRemove={handleRemoveSuggestion}
                onVoteChange={handleVoteChange}
                onCommentsChange={handleCommentsChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Members Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="relative group">
              <MemberCard member={member} clubId={club.id} />
              {isOwner && member.user_id !== user?.id && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveMember(member.user_id);
                  }}
                  className="absolute -top-2 -right-2 p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove member"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Suggest Book Modal */}
      {user && club && (
        <SuggestBookModal
          isOpen={showSuggestModal}
          onClose={() => setShowSuggestModal(false)}
          clubId={club.id}
          userId={user.id}
          userBooks={memberBooks.get(user.id) || []}
          existingSuggestions={suggestions}
          onSuggestionAdded={handleSuggestionAdded}
        />
      )}
    </div>
  );
}
