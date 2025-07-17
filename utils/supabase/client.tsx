import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks (browser-only)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

// Check if we're in development mode
const isDevelopment = import.meta.env?.MODE === 'development' || 
                     typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Mock Supabase client for demo/development purposes
const createMockSupabaseClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null })
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
      createSignedUrl: async () => ({ data: null, error: null }),
      list: async () => ({ data: [], error: null })
    })
  },
  rpc: async () => ({ data: null, error: null })
});

// Singleton pattern for Supabase client
let supabaseInstance: ReturnType<typeof createClient> | any = null;

// Create Supabase client with error handling
export function createSupabaseClient() {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check if environment variables are available
  const hasValidConfig = supabaseUrl && supabaseAnonKey && 
                        supabaseUrl.startsWith('https://') && 
                        supabaseAnonKey.length > 20;

  if (!hasValidConfig) {
    if (isDevelopment) {
      console.warn('⚠️ Supabase configuration not found. Using mock client for development.');
      console.info('💡 To use real Supabase, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
    }
    
    // Return mock client for development/demo
    supabaseInstance = createMockSupabaseClient();
    return supabaseInstance;
  }

  try {
    // Create real Supabase client
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    if (isDevelopment) {
      console.info('✅ Supabase client initialized successfully');
    }

    return supabaseInstance;
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    
    // Fallback to mock client
    supabaseInstance = createMockSupabaseClient();
    return supabaseInstance;
  }
}

// Get the Supabase client instance
export function getSupabaseClient() {
  return createSupabaseClient();
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && 
           supabaseUrl.startsWith('https://') && 
           supabaseAnonKey.length > 20);
}

// Get configuration status for debugging
export function getSupabaseConfig() {
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured(),
    isDevelopment,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not set',
    keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'Not set'
  };
}

// Export default client for convenience
export const supabase = createSupabaseClient();