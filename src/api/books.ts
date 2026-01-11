import { supabase } from './supabase';
import type { Book } from '@/types';

export async function getBook(id: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getBookByOpenLibraryId(openLibraryId: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('open_library_id', openLibraryId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> {
  const { data, error } = await supabase
    .from('books')
    .insert(book)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrCreateBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> {
  if (book.open_library_id) {
    const existing = await getBookByOpenLibraryId(book.open_library_id);
    if (existing) return existing;
  }

  return createBook(book);
}
