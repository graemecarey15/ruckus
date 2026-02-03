import { supabase } from './supabase';
import type { TbrCategory } from '@/types';

export async function getUserTbrCategories(userId: string): Promise<TbrCategory[]> {
  const { data, error } = await supabase
    .from('tbr_categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTbrCategory(
  userId: string,
  category: { name: string; color: string }
): Promise<TbrCategory> {
  // Get max sort_order for user
  const { data: existing } = await supabase
    .from('tbr_categories')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('tbr_categories')
    .insert({
      user_id: userId,
      name: category.name,
      color: category.color,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTbrCategory(
  id: string,
  updates: Partial<Pick<TbrCategory, 'name' | 'color' | 'sort_order'>>
): Promise<TbrCategory> {
  const { data, error } = await supabase
    .from('tbr_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTbrCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('tbr_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setBookCategories(
  userBookId: string,
  categoryIds: string[]
): Promise<void> {
  // Delete existing categories for this book
  const { error: deleteError } = await supabase
    .from('user_book_categories')
    .delete()
    .eq('user_book_id', userBookId);

  if (deleteError) throw deleteError;

  // Insert new categories
  if (categoryIds.length > 0) {
    const { error: insertError } = await supabase
      .from('user_book_categories')
      .insert(
        categoryIds.map((categoryId) => ({
          user_book_id: userBookId,
          category_id: categoryId,
        }))
      );

    if (insertError) throw insertError;
  }
}

export async function getBookCategories(userBookId: string): Promise<TbrCategory[]> {
  const { data, error } = await supabase
    .from('user_book_categories')
    .select('category:tbr_categories(*)')
    .eq('user_book_id', userBookId);

  if (error) throw error;
  return data.map((row) => row.category as TbrCategory);
}

export async function getCategoriesWithCounts(
  userId: string
): Promise<(TbrCategory & { book_count: number })[]> {
  // Get categories
  const { data: categories, error: catError } = await supabase
    .from('tbr_categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (catError) throw catError;

  // Get counts for each category
  const { data: counts, error: countError } = await supabase
    .from('user_book_categories')
    .select('category_id')
    .in(
      'category_id',
      categories.map((c) => c.id)
    );

  if (countError) throw countError;

  // Count occurrences of each category
  const countMap = counts.reduce(
    (acc, row) => {
      acc[row.category_id] = (acc[row.category_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return categories.map((cat) => ({
    ...cat,
    book_count: countMap[cat.id] || 0,
  }));
}
