import type { Book, UserBook } from '@/types';
import { BookCard } from './BookCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface BookGridProps {
  books: (UserBook & { book: Book })[];
  showProgress?: boolean;
  emptyMessage?: string;
}

export function BookGrid({ books, showProgress = false, emptyMessage }: BookGridProps) {
  if (books.length === 0) {
    return (
      <EmptyState
        title="No books yet"
        description={emptyMessage || "You haven't added any books to this list yet."}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((userBook) => (
        <BookCard
          key={userBook.id}
          book={userBook.book}
          userBook={userBook}
          showProgress={showProgress}
          linkTo={`/book/${userBook.book_id}`}
        />
      ))}
    </div>
  );
}
