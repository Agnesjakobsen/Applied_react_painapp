// This file is used to initialize the Supabase client.
// It connects to the Supabase backend using the project URL and anon key.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vgfbzaycersfzjrqfxwv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZmJ6YXljZXJzZnpqcnFmeHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTc4MDIsImV4cCI6MjA2MDg5MzgwMn0.bf3UE3_z0S9dMmIVL-oeYPyXl8TMVVSGWWMtFjPQ7-E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
