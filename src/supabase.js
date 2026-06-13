import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});

const PAGE_SIZE = 1000;

/**
 * Fetch ALL rows for a table+filter, paging past PostgREST's 1000-row cap.
 * Without this, high-volume sessions (30+ voters) silently lose votes because
 * Supabase returns only the first 1000 rows by default.
 */
export async function fetchAllRows(table, applyFilters) {
  let from = 0;
  const all = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = supabase.from(table).select("*");
    query = applyFilters(query).range(from, from + PAGE_SIZE - 1);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

/** Retry an async DB op a few times with backoff — survives high-load blips. */
export async function withRetry(fn, attempts = 4, baseDelay = 400) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await fn();
      if (result && result.error) {
        lastErr = result.error;
        // Unique-violation is a real conflict, not a transient failure
        if (result.error.code === "23505") return result;
      } else {
        return result;
      }
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
  }
  return { error: lastErr };
}
