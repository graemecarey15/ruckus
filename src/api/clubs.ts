import { supabase } from './supabase';
import type { Club, ClubMember, ClubBookSuggestion, SuggestionVote, SuggestionComment } from '@/types';

export async function getUserClubs(userId: string): Promise<Club[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select('club:clubs(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map((item) => item.club as unknown as Club);
}

export async function getClub(id: string): Promise<Club | null> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getClubByInviteCode(inviteCode: string): Promise<Club | null> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createClub(
  club: Pick<Club, 'name' | 'description' | 'is_public'>,
  userId: string
): Promise<Club> {
  const { data, error } = await supabase
    .from('clubs')
    .insert({ ...club, created_by: userId })
    .select()
    .single();

  if (error) throw error;

  // Add creator as owner
  await supabase.from('club_members').insert({
    club_id: data.id,
    user_id: userId,
    role: 'owner',
  });

  return data;
}

export async function updateClub(
  id: string,
  updates: Partial<Pick<Club, 'name' | 'description' | 'cover_image_url' | 'is_public'>>
): Promise<Club> {
  const { data, error } = await supabase
    .from('clubs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClub(id: string): Promise<void> {
  const { error } = await supabase.from('clubs').delete().eq('id', id);
  if (error) throw error;
}

// Club Members
export async function getClubMembers(clubId: string): Promise<ClubMember[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select('*, profile:profiles(*)')
    .eq('club_id', clubId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function joinClub(clubId: string, userId: string): Promise<ClubMember> {
  const { data, error } = await supabase
    .from('club_members')
    .insert({ club_id: clubId, user_id: userId, role: 'member' })
    .select('*, profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function leaveClub(clubId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('club_id', clubId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateMemberRole(
  clubId: string,
  userId: string,
  role: ClubMember['role']
): Promise<ClubMember> {
  const { data, error } = await supabase
    .from('club_members')
    .update({ role })
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .select('*, profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function removeMember(clubId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('club_id', clubId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Club Book Suggestions
export async function getClubSuggestions(clubId: string): Promise<ClubBookSuggestion[]> {
  const { data, error } = await supabase
    .from('club_book_suggestions')
    .select('*, book:books(*), profile:profiles(*)')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function suggestBook(
  clubId: string,
  bookId: string,
  userId: string,
  note?: string
): Promise<ClubBookSuggestion> {
  const { data, error } = await supabase
    .from('club_book_suggestions')
    .insert({ club_id: clubId, book_id: bookId, suggested_by: userId, note })
    .select('*, book:books(*), profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function removeSuggestion(suggestionId: string): Promise<void> {
  const { error } = await supabase
    .from('club_book_suggestions')
    .delete()
    .eq('id', suggestionId);

  if (error) throw error;
}

// Suggestion Votes
export async function getVotesForSuggestion(suggestionId: string): Promise<SuggestionVote[]> {
  const { data, error } = await supabase
    .from('club_suggestion_votes')
    .select('*, profile:profiles(*)')
    .eq('suggestion_id', suggestionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function voteForSuggestion(suggestionId: string, userId: string): Promise<SuggestionVote> {
  const { data, error } = await supabase
    .from('club_suggestion_votes')
    .insert({ suggestion_id: suggestionId, user_id: userId })
    .select('*, profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function removeVote(suggestionId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('club_suggestion_votes')
    .delete()
    .eq('suggestion_id', suggestionId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Suggestion Comments
export async function getCommentsForSuggestion(suggestionId: string): Promise<SuggestionComment[]> {
  const { data, error } = await supabase
    .from('club_suggestion_comments')
    .select('*, profile:profiles(*)')
    .eq('suggestion_id', suggestionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function addComment(
  suggestionId: string,
  userId: string,
  content: string
): Promise<SuggestionComment> {
  const { data, error } = await supabase
    .from('club_suggestion_comments')
    .insert({ suggestion_id: suggestionId, user_id: userId, content })
    .select('*, profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateComment(commentId: string, content: string): Promise<SuggestionComment> {
  const { data, error } = await supabase
    .from('club_suggestion_comments')
    .update({ content })
    .eq('id', commentId)
    .select('*, profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('club_suggestion_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}
