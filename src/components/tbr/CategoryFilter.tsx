import type { TbrCategory } from '@/types';

export type CategoryFilterValue = 'all' | 'uncategorized' | string;

interface CategoryFilterProps {
  categories: TbrCategory[];
  selectedCategory: CategoryFilterValue;
  onSelectCategory: (value: CategoryFilterValue) => void;
  onManageClick: () => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  onManageClick,
}: CategoryFilterProps) {
  const chipBase =
    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer';
  const chipActive = 'bg-indigo-600 text-white';
  const chipInactive = 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={`${chipBase} ${selectedCategory === 'all' ? chipActive : chipInactive}`}
        onClick={() => onSelectCategory('all')}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          className={`${chipBase} transition-colors`}
          style={
            selectedCategory === category.id
              ? {
                  backgroundColor: category.color,
                  color: 'white',
                }
              : {
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                  border: `1px solid ${category.color}40`,
                }
          }
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </button>
      ))}

      <button
        className={`${chipBase} ${selectedCategory === 'uncategorized' ? chipActive : chipInactive}`}
        onClick={() => onSelectCategory('uncategorized')}
      >
        Uncategorized
      </button>

      <button
        className={`${chipBase} border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600`}
        onClick={onManageClick}
      >
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Manage
        </span>
      </button>
    </div>
  );
}
