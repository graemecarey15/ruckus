import { supabase } from './supabase';
import type { UserBook, ReadingStatus, TbrCategory } from '@/types';

export async function getUserBooks(userId: string): Promise<UserBook[]> {
  const { data, error } = await supabase
    .from('user_books')
    .select('*, book:books(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // Fetch categories for TBR books
  const tbrBooks = data.filter((b) => b.status === 'want_to_read');
  if (tbrBooks.length > 0) {
    const { data: bookCategories, error: catError } = await supabase
      .from('user_book_categories')
      .select('user_book_id, category:tbr_categories(*)')
      .in(
        'user_book_id',
        tbrBooks.map((b) => b.id)
      );

    if (!catError && bookCategories) {
      const categoryMap = bookCategories.reduce(
        (acc, row) => {
          if (!acc[row.user_book_id]) {
            acc[row.user_book_id] = [];
          }
          acc[row.user_book_id].push(row.category as unknown as TbrCategory);
          return acc;
        },
        {} as Record<string, TbrCategory[]>
      );

      return data.map((book) => ({
        ...book,
        categories: categoryMap[book.id] || [],
      }));
    }
  }

  return data.map((book) => ({ ...book, categories: [] }));
}

export async function getUserBooksByStatus(userId: string, status: ReadingStatus): Promise<UserBook[]> {
  const { data, error } = await supabase
    .from('user_books')
    .select('*, book:books(*)')
    .eq('user_id', userId)
    .eq('status', status)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserBook(userId: string, bookId: string): Promise<UserBook | null> {
  const { data, error } = await supabase
    .from('user_books')
    .select('*, book:books(*)')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function addBookToLibrary(
  userId: string,
  bookId: string,
  status: ReadingStatus = 'want_to_read'
): Promise<UserBook> {
  const { data, error } = await supabase
    .from('user_books')
    .insert({
      user_id: userId,
      book_id: bookId,
      status,
      started_at: status === 'currently_reading' ? new Date().toISOString().split('T')[0] : null,
    })
    .select('*, book:books(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserBook(
  id: string,
  updates: Partial<Pick<UserBook, 'status' | 'current_page' | 'rating' | 'started_at' | 'finished_at'>>
): Promise<UserBook> {
  const { data, error } = await supabase
    .from('user_books')
    .update(updates)
    .eq('id', id)
    .select('*, book:books(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateReadingStatus(id: string, status: ReadingStatus): Promise<UserBook> {
  const updates: Partial<UserBook> = { status };

  if (status === 'currently_reading') {
    updates.started_at = new Date().toISOString().split('T')[0];
  } else if (status === 'finished') {
    updates.finished_at = new Date().toISOString().split('T')[0];
  }

  return updateUserBook(id, updates);
}

export async function updateProgress(id: string, currentPage: number): Promise<UserBook> {
  return updateUserBook(id, { current_page: currentPage });
}

export async function removeFromLibrary(id: string): Promise<void> {
  const { error } = await supabase.from('user_books').delete().eq('id', id);
  if (error) throw error;
}
