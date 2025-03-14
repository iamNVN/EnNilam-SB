
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sckzsqyesbculskcztlo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNja3pzcXllc2JjdWxza2N6dGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNjcxNzEsImV4cCI6MjA1NDg0MzE3MX0.gWaZLIHp7gLJq7uJlaGHCmrkmstXi5_UCDB4B9NCv7s";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
