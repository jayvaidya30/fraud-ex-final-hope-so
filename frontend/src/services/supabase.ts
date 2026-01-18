import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn(
            'Supabase credentials not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
        );
        // Return a mock client that will fail gracefully
        return null as unknown as ReturnType<typeof createBrowserClient>;
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton client for use in client components
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
}

export function isSupabaseConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
}
