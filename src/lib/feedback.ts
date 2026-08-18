import { supabase } from './supabase';

export type FeedbackItem = {
  id: string;
  message: string;
  created_at: string;
};

export async function submitFeedback(message: string) {
  const cleanMessage = message.trim();
  if (cleanMessage.length < 3) return { ok: false, message: 'Write a little more first.' };
  if (cleanMessage.length > 1200) return { ok: false, message: 'Keep feedback under 1200 characters.' };

  const { error } = await supabase.from('feedback').insert({ message: cleanMessage });
  if (error) return { ok: false, message: feedbackErrorMessage(error.message) };
  return { ok: true, message: 'Feedback sent. Thank you.' };
}

export async function loadFeedback() {
  const { data, error } = await supabase
    .from('feedback')
    .select('id, message, created_at')
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) return { ok: false, message: feedbackErrorMessage(error.message), items: [] as FeedbackItem[] };
  return { ok: true, message: '', items: data as FeedbackItem[] };
}

export async function deleteFeedback(id: string) {
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) return { ok: false, message: feedbackErrorMessage(error.message) };
  return { ok: true, message: 'Feedback deleted.' };
}

export async function canDeleteFeedback() {
  const session = await supabase.auth.getSession();
  const sessionEmail = session.data.session?.user.email?.toLowerCase();
  if (sessionEmail) return sessionEmail === 'muhahahehe585@gmail.com';
  const { data } = await supabase.auth.getUser();
  return data.user?.email?.toLowerCase() === 'muhahahehe585@gmail.com';
}

function feedbackErrorMessage(error: string) {
  if (error.includes('feedback') && error.includes('schema cache')) {
    return 'Feedback table is not ready yet. Run the Supabase migration.';
  }
  return error;
}
