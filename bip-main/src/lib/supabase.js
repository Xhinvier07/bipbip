import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://kulwslcvdraoehedpouj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bHdzbGN2ZHJhb2VoZWRwb3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDM3MzIsImV4cCI6MjA3MTI3OTczMn0.KaRNZHiqiesYGtmkD-Gq0ec5pZyc5FeQtVGDSoWGHJU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
