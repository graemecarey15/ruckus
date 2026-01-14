import { useState } from 'react';
import { BookCover } from '@/components/books/BookCover';
import { Avatar } from '@/components/ui/Avatar';
import { SuggestionComments } from './SuggestionComments';
import { voteForSuggestion, removeVote } from '@/api/clubs';
import type { ClubBookSuggestion, SuggestionVote, SuggestionComment } from '@/types';

interface SuggestionCardProps {
  suggestion: ClubBookSuggestion;
  userId: string;
  isOwner: boolean;
  votes: SuggestionVote[];
  comments: SuggestionComment[];
  hasBook: boolean;
  onAddToLibrary: (bookId: string) => void;
  onRemove: (suggestionId: string) => void;
  onVoteChange: (suggestionId: string, votes: SuggestionVote[]) => void;
  onCommentsChange: (suggestionId: string, comments: SuggestionComment[]) => void;
}

export function SuggestionCard({
  suggestion,
  userId,
  isOwner,
  votes,
  comments,
  hasBook,
  onAddToLibrary,
  onRemove,
  onVoteChange,
  onCommentsChange,
}: SuggestionCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [voting, setVoting] = useState(false);

  const userHasVoted = votes.some((v) => v.user_id === userId);
  const canRemove = isOwner || suggestion.suggested_by === userId;

  const handleVote = async () => {
    setVoting(true);
    try {
      if (userHasVoted) {
        await removeVote(suggestion.id, userId);
        onVoteChange(suggestion.id, votes.filter((v) => v.user_id !== userId));
      } else {
        const newVote = await voteForSuggestion(suggestion.id, userId);
        onVoteChange(suggestion.id, [...votes, newVote]);
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setVoting(false);
    }
  };

  const handleRemove = () => {
    if (confirm('Remove this suggestion?')) {
      onRemove(suggestion.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex gap-3">
        <BookCover
          src={suggestion.book?.cover_url}
          title={suggestion.book?.title || 'Book'}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
            {suggestion.book?.title}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {suggestion.book?.authors?.join(', ')}
          </p>

          {/* Suggested by */}
          <div className="flex items-center gap-1.5 mt-2">
            <Avatar
              src={suggestion.profile?.avatar_url}
              name={suggestion.profile?.display_name || suggestion.profile?.username || ''}
              size="sm"
            />
            <span className="text-xs text-gray-500">suggested</span>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-3 mt-3">
            {/* Vote button */}
            <button
              onClick={handleVote}
              disabled={voting}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                userHasVoted
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg
                className={`h-3.5 w-3.5 ${userHasVoted ? 'fill-current' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{votes.length}</span>
            </button>

            {/* Comments toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{comments.length}</span>
            </button>

            {/* Add to library */}
            {!hasBook && (
              <button
                onClick={() => onAddToLibrary(suggestion.book_id)}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                + Library
              </button>
            )}

            {/* Remove button */}
            {canRemove && (
              <button
                onClick={handleRemove}
                className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                title="Remove suggestion"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <SuggestionComments
            suggestionId={suggestion.id}
            userId={userId}
            comments={comments}
            onCommentsChange={(newComments) => onCommentsChange(suggestion.id, newComments)}
          />
        </div>
      )}
    </div>
  );
}
