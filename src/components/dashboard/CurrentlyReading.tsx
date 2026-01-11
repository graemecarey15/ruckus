import { Link } from 'react-router-dom';
import type { UserBook, Book } from '@/types';
import { BookCover } from '@/components/books/BookCover';
import { ProgressBar } from '@/components/books/ProgressBar';

interface CurrentlyReadingProps {
  books: (UserBook & { book: Book })[];
}

export function CurrentlyReading({ books }: CurrentlyReadingProps) {
  if (books.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Currently Reading</h2>
        <p className="text-gray-500 text-sm">You're not reading any books right now.</p>
        <Link
          to="/search"
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block"
        >
          Find a book to read
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Currently Reading</h2>
      <div className="space-y-4">
        {books.slice(0, 3).map((userBook) => (
          <Link
            key={userBook.id}
            to={`/book/${userBook.book_id}`}
            className="flex gap-3 hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
          >
            <BookCover src={userBook.book.cover_url} title={userBook.book.title} size="sm" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                {userBook.book.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-1">
                {userBook.book.authors.join(', ')}
              </p>
              {userBook.book.page_count && (
                <div className="mt-2">
                  <ProgressBar
                    current={userBook.current_page}
                    total={userBook.book.page_count}
                    showLabel={false}
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      {books.length > 3 && (
        <Link
          to="/library"
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-4 inline-block"
        >
          View all ({books.length})
        </Link>
      )}
    </div>
  );
}
