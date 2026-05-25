import { supabase } from './supabase';
import { siteUrl } from '@/native/capacitor';

// App Store Review bypass — Ruckus uses OTP-only auth, but Apple's reviewers
// can't receive OTP emails. This account is pre-created in Supabase with
// realistic demo content; the bypass lets the reviewer enter REVIEWER_OTP
// instead of waiting on a real OTP email. The OTP doubles as the Supabase
// password for this account so there's only one secret to track.
const REVIEWER_EMAIL = 'apple-reviewer@goodertechs.com';
const REVIEWER_OTP = '424242';

export async function sendOtpCode(email: string) {
  if (email === REVIEWER_EMAIL) {
    return { message: 'Use the reviewer code to sign in.' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) throw error;
  return { message: 'Check your email for the code!' };
}

export async function verifyOtpCode(email: string, token: string) {
  if (email === REVIEWER_EMAIL && token === REVIEWER_OTP) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: REVIEWER_EMAIL,
      password: REVIEWER_OTP,
    });
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}
