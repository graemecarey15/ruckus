import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { addComment, updateComment, deleteComment } from '@/api/clubs';
import type { SuggestionComment } from '@/types';

interface SuggestionCommentsProps {
  suggestionId: string;
  userId: string;
  comments: SuggestionComment[];
  onCommentsChange: (comments: SuggestionComment[]) => void;
}

export function SuggestionComments({
  suggestionId,
  userId,
  comments,
  onCommentsChange,
}: SuggestionCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await addComment(suggestionId, userId, newComment.trim());
      onCommentsChange([...comments, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment: SuggestionComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    try {
      const updated = await updateComment(editingId, editContent.trim());
      onCommentsChange(comments.map((c) => (c.id === editingId ? updated : c)));
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await deleteComment(commentId);
      onCommentsChange(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="space-y-3">
      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar
                src={comment.profile?.avatar_url}
                name={comment.profile?.display_name || comment.profile?.username || ''}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-900">
                    {comment.profile?.display_name || comment.profile?.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>

                {editingId === comment.id ? (
                  <div className="mt-1">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={handleSaveEdit}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 mt-0.5">{comment.content}</p>
                )}

                {/* Edit/Delete actions */}
                {editingId !== comment.id && (
                  <div className="flex gap-2 mt-1">
                    {comment.user_id === userId && (
                      <button
                        onClick={() => handleEdit(comment)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center">No comments yet</p>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </form>
    </div>
  );
}
