import { useState, useRef, useEffect } from 'react';
import type { TbrCategory } from '@/types';
import { setBookCategories } from '@/api/tbrCategories';

interface BookCategorySelectorProps {
  userBookId: string;
  categories: TbrCategory[];
  allCategories: TbrCategory[];
  onCategoriesChange: (categories: TbrCategory[]) => void;
}

export function BookCategorySelector({
  userBookId,
  categories,
  allCategories,
  onCategoriesChange,
}: BookCategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(categories.map((c) => c.id));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = async (category: TbrCategory) => {
    setLoading(true);
    const newIds = selectedIds.has(category.id)
      ? Array.from(selectedIds).filter((id) => id !== category.id)
      : [...Array.from(selectedIds), category.id];

    try {
      await setBookCategories(userBookId, newIds);
      const newCategories = allCategories.filter((c) => newIds.includes(c.id));
      onCategoriesChange(newCategories);
    } catch (err) {
      console.error('Failed to update categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (allCategories.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
      >
        {categories.length === 0 ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Add category
          </>
        ) : (
          <>
            <div className="flex -space-x-1">
              {categories.slice(0, 3).map((cat) => (
                <div
                  key={cat.id}
                  className="w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: cat.color }}
                  title={cat.name}
                />
              ))}
            </div>
            {categories.length > 3 && (
              <span className="text-gray-500">+{categories.length - 3}</span>
            )}
          </>
        )}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200">
          {allCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category)}
              disabled={loading}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50"
            >
              <div
                className="w-4 h-4 rounded border-2 flex items-center justify-center"
                style={{
                  borderColor: category.color,
                  backgroundColor: selectedIds.has(category.id) ? category.color : 'transparent',
                }}
              >
                {selectedIds.has(category.id) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className="flex-1"
                style={{ color: selectedIds.has(category.id) ? category.color : undefined }}
              >
                {category.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
