
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Create a singleton Supabase client to avoid multiple instances
let supabaseInstance: SupabaseClient | null = null;
let instanceCreationCount = 0;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    instanceCreationCount++;
    console.log(`Creating Supabase client instance #${instanceCreationCount}`);
    
    supabaseInstance = createClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Set a specific storage key to avoid conflicts
        storageKey: 'zerozero-supabase-auth-token',
      },
      global: {
        headers: {
          'X-Client-Info': 'zerozero-app',
        },
      },
    });
    
    // Add event listener to track auth state changes
    supabaseInstance.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state change:', event, session ? 'session exists' : 'no session');
    });
    
  } else {
    console.log('Reusing existing Supabase client instance');
  }
  return supabaseInstance;
};

// Export the singleton instance
export const supabase = getSupabaseClient();

export default supabase;

// Helper function to reset the singleton (useful for testing)
export const resetSupabaseInstance = () => {
  if (supabaseInstance) {
    console.log('Resetting Supabase client instance');
  }
  supabaseInstance = null;
};

// Export debug info
export const getDebugInfo = () => ({
  instanceCreationCount,
  hasInstance: !!supabaseInstance,
  url: supabaseUrl,
});
