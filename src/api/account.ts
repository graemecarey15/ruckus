import { supabase } from './supabase';

// Does not sign out — caller is responsible for that after showing the
// user any post-deletion confirmation UI. Signing out here would update
// AuthContext immediately and unmount the screen that called us.
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
}
