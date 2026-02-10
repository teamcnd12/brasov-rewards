const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
const ADMIN_PASSWORD = 'bolec2008';

export async function adminFetch(body: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: ADMIN_PASSWORD, ...body }),
  });
  return res.json();
}
