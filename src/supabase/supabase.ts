import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yixvofqwidmmnjspwtqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpeHZvZnF3aWRtbW5qc3B3dHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MTQyMzIsImV4cCI6MjA1MzI5MDIzMn0.Tb4cbfHGgKhtSj0cPlMZSMEIv3oFkEIQnkDjvQHDDgo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



