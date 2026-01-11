import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {note.title && (
            <h3 className="font-semibold text-gray-900 mb-1">{note.title}</h3>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
            {note.page_number && <span>Page {note.page_number}</span>}
            {note.chapter && <span>Chapter: {note.chapter}</span>}
            <span>{formattedDate}</span>
          </div>
          <div className="flex gap-2 mb-2">
            {note.is_summary && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                Summary
              </span>
            )}
            {note.is_private && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                Private
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Edit note"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete note"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}
