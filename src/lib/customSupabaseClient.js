import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vxxmumtlhvfltkyooxoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eG11bXRsaHZmbHRreW9veG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4ODcyOTQsImV4cCI6MjA2NjQ2MzI5NH0.TKisS7Tx64VUuMbmAwFxbqFq7UPArZ8EUOcxWmJxAhQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);