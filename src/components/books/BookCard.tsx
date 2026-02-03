import { Link } from 'react-router-dom';
import type { Book, UserBook, TbrCategory } from '@/types';
import { BookCover } from './BookCover';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { BookCategorySelector } from '@/components/tbr/BookCategorySelector';
import { CategoryChip } from '@/components/tbr/CategoryChip';

interface BookCardProps {
  book: Book;
  userBook?: UserBook;
  showProgress?: boolean;
  showStatus?: boolean;
  showCategorySelector?: boolean;
  allCategories?: TbrCategory[];
  onCategoriesChange?: (categories: TbrCategory[]) => void;
  linkTo?: string;
}

export function BookCard({
  book,
  userBook,
  showProgress = false,
  showStatus = true,
  showCategorySelector = false,
  allCategories = [],
  onCategoriesChange,
  linkTo,
}: BookCardProps) {
  const categories = userBook?.categories || [];

  const content = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <BookCover src={book.cover_url} title={book.title} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {book.authors.join(', ')}
          </p>
          {book.publish_year && (
            <p className="text-xs text-gray-500 mt-1">{book.publish_year}</p>
          )}
          {userBook && showStatus && (
            <div className="mt-2">
              <StatusBadge status={userBook.status} />
            </div>
          )}
          {userBook &&
            showProgress &&
            userBook.status === 'currently_reading' &&
            book.page_count && (
              <div className="mt-3">
                <ProgressBar
                  current={userBook.current_page}
                  total={book.page_count}
                />
              </div>
            )}
          {showCategorySelector && userBook && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {categories.map((cat) => (
                <CategoryChip key={cat.id} category={cat} size="sm" />
              ))}
              <BookCategorySelector
                userBookId={userBook.id}
                categories={categories}
                allCategories={allCategories}
                onCategoriesChange={onCategoriesChange || (() => {})}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
