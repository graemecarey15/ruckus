import type { Note } from '@/types';
import { NoteCard } from './NoteCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export function NotesList({ notes, onEdit, onDelete }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes yet"
        description="Add notes to capture your thoughts about this book."
      />
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={() => onEdit(note)}
          onDelete={() => onDelete(note.id)}
        />
      ))}
    </div>
  );
}
