import { useState } from 'react';
import type { ReadingStatus } from '@/types';

interface StatusSelectorProps {
  status: ReadingStatus;
  onChange: (status: ReadingStatus) => Promise<void>;
}

const statusOptions: { value: ReadingStatus; label: string }[] = [
  { value: 'want_to_read', label: 'TBR' },
  { value: 'currently_reading', label: 'Currently Reading' },
  { value: 'finished', label: 'Finished' },
];

export function StatusSelector({ status, onChange }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentOption = statusOptions.find((o) => o.value === status);

  const handleChange = async (newStatus: ReadingStatus) => {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await onChange(newStatus);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? 'Updating...' : currentOption?.label}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleChange(option.value)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  option.value === status ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
