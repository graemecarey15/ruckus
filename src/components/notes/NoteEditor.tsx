import { useState } from 'react';
import type { Note } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (note: Partial<Note>) => Promise<void>;
  onCancel: () => void;
}

export function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [pageNumber, setPageNumber] = useState(note?.page_number?.toString() || '');
  const [chapter, setChapter] = useState(note?.chapter || '');
  const [isSummary, setIsSummary] = useState(note?.is_summary || false);
  const [isPrivate, setIsPrivate] = useState(note?.is_private || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title: title.trim() || null,
        content: content.trim(),
        page_number: pageNumber ? parseInt(pageNumber) : null,
        chapter: chapter.trim() || null,
        is_summary: isSummary,
        is_private: isPrivate,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <Input
        label="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give your note a title..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Page number (optional)"
          type="number"
          value={pageNumber}
          onChange={(e) => setPageNumber(e.target.value)}
          placeholder="Page #"
        />
        <Input
          label="Chapter (optional)"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          placeholder="Chapter name"
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSummary}
            onChange={(e) => setIsSummary(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Mark as summary</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Private (only visible to you)</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" loading={loading}>
          {note ? 'Update Note' : 'Save Note'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
