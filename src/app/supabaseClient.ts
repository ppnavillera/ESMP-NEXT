import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Supabase URL and Key are required."); //타입스크립트 오류 방지
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
