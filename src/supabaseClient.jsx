// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

// Optional: You can add an auth state change listener here for debugging,
// but our AuthContext will primarily handle state.
// supabase.auth.onAuthStateChange((event, session) => {
//   console.log('Supabase auth event:', event, session);
// });