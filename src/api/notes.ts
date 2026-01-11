import { supabase } from './supabase';
import type { Note } from '@/types';

export async function getNotes(userBookId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_book_id', userBookId)
    .order('page_number', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getNote(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createNote(
  note: Omit<Note, 'id' | 'created_at' | 'updated_at'>
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNote(
  id: string,
  updates: Partial<Pick<Note, 'title' | 'content' | 'page_number' | 'chapter' | 'is_summary' | 'is_private'>>
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}
