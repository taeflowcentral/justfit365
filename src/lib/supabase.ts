import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajxebgmpehzwaprzkheu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeGViZ21wZWh6d2FwcnpraGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDMwMTgsImV4cCI6MjA5MTE3OTAxOH0.mtxoIRRcqhk0mcIymWxTrw7bT3uWSGMpkn-1yYKHVeo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
