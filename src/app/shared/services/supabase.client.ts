import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lhaoyffyjfmxzulbeokm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_l7UHAXpHDtRGOqSDA-whQQ_fJaO1bX1';

export const isSupabaseConfigured =
  SUPABASE_URL.trim().length > 0 &&
  SUPABASE_ANON_KEY.trim().length > 0;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
