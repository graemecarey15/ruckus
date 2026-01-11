import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from './ProgressBar';

interface ProgressTrackerProps {
  currentPage: number;
  totalPages: number;
  onUpdate: (page: number) => Promise<void>;
}

export function ProgressTracker({ currentPage, totalPages, onUpdate }: ProgressTrackerProps) {
  const [page, setPage] = useState(currentPage);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (page === currentPage) {
      setEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onUpdate(page);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Reading Progress</span>
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Update
          </button>
        </div>
        <ProgressBar current={currentPage} total={totalPages} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Update Progress</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={totalPages}
          value={page}
          onChange={(e) => setPage(Number(e.target.value))}
          className="flex-1"
        />
        <input
          type="number"
          min={0}
          max={totalPages}
          value={page}
          onChange={(e) => setPage(Math.min(Number(e.target.value), totalPages))}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
        />
        <span className="text-sm text-gray-500">/ {totalPages}</span>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={handleSave} loading={loading}>
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setPage(currentPage);
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
