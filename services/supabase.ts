import { createClient } from '@supabase/supabase-js';

// Safely access Vite environment variables
const getEnvVar = (key: string, fallback: string = ''): string => {
  try {
    // In Vite, environment variables are available through import.meta.env
    const env = import.meta.env;
    if (env && typeof env === 'object' && key in env) {
      return env[key] || fallback;
    }
    return fallback;
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return fallback;
  }
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Check if we have proper environment variables
const hasValidSupabaseConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') && 
  supabaseAnonKey.length > 20 &&
  !supabaseUrl.includes('mock') &&
  !supabaseAnonKey.includes('mock');

if (!hasValidSupabaseConfig) {
  console.log('ℹ️ Supabase: Running in mock data mode');
  console.log('   To connect to live database:');
  console.log('   1. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
  console.log('   2. Get these values from your Supabase project dashboard');
  console.log('   3. The app will automatically switch to live mode');
}

// Create Supabase client with fallback values for development
export const supabase = hasValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock.supabase.co', 'mock-key');

// API base URL for server functions
const getApiUrl = (endpoint: string) => {
  if (!hasValidSupabaseConfig) {
    return null; // Use mock mode
  }
  
  try {
    const projectId = supabaseUrl.split('//')[1].split('.')[0];
    return `https://${projectId}.supabase.co/functions/v1/server${endpoint}`;
  } catch (error) {
    console.error('Error constructing API URL:', error);
    return null;
  }
};

// API helper function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = getApiUrl(endpoint);
  if (!url) {
    throw new Error('Mock mode - API not available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Database Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  postcode: string;
  transport_mode?: string;
  home_type?: string;
  spend_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface CardInteraction {
  id: string;
  user_id: string;
  card_id: string;
  card_category: string;
  action_taken: 'accept' | 'reject' | 'input_submitted' | 'expanded' | 'link_clicked';
  action_data?: any;
  points_earned?: number;
  created_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  total_points: number;
  carbon_saved_kg: number;
  money_saved_pounds: number;
  actions_completed: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

export interface ZaiTip {
  id: string;
  card_category: string;
  tip_text: string;
  context_data?: any;
  effectiveness_score: number;
  created_at: string;
}

// Initialize database (call once on app startup)
export async function initializeDatabase() {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: initializeDatabase - skipping');
    return { success: true, message: 'Mock mode - database not initialized' };
  }

  try {
    const result = await apiRequest('/init', { method: 'POST' });
    console.log('✅ Database initialized successfully');
    return result;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// User Profile Functions
export async function createUserProfile(userData: any): Promise<UserProfile | null> {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: createUserProfile', userData);
    return { 
      id: 'mock-1', 
      email: userData.email || `${userData.name}@temp.com`,
      name: userData.name,
      postcode: userData.postcode,
      transport_mode: userData.transportMode,
      home_type: userData.homeType,
      spend_amount: userData.spendAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  try {
    const result = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return result;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: getUserProfile', userId);
    return mockUserData;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Card Interaction Functions
export async function logCardInteraction(interaction: Omit<CardInteraction, 'id' | 'created_at'>): Promise<CardInteraction | null> {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: logCardInteraction', interaction);
    return { 
      id: `mock-${Date.now()}`, 
      ...interaction, 
      created_at: new Date().toISOString() 
    };
  }

  try {
    const result = await apiRequest('/interactions', {
      method: 'POST',
      body: JSON.stringify(interaction)
    });
    return result;
  } catch (error) {
    console.error('Error logging card interaction:', error);
    return null;
  }
}

export async function getUserCardInteractions(userId: string, limit: number = 50): Promise<CardInteraction[]> {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: getUserCardInteractions', userId);
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('card_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching card interactions:', error);
    return [];
  }
}

// Rewards Functions
export async function getUserRewards(userId: string): Promise<UserReward | null> {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: getUserRewards', userId);
    return mockRewardsData;
  }

  try {
    const result = await apiRequest(`/rewards/${userId}`, { method: 'GET' });
    return result;
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return null;
  }
}

export async function updateUserRewards(userId: string, updates: Partial<UserReward>): Promise<UserReward | null> {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: updateUserRewards', userId, updates);
    return { ...mockRewardsData, ...updates };
  }

  try {
    const result = await apiRequest(`/rewards/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return result;
  } catch (error) {
    console.error('Error updating user rewards:', error);
    return null;
  }
}

export async function addPoints(userId: string, points: number, carbonSaved: number = 0, moneySaved: number = 0): Promise<UserReward | null> {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: addPoints', { userId, points, carbonSaved, moneySaved });
    return {
      ...mockRewardsData,
      total_points: mockRewardsData.total_points + points,
      carbon_saved_kg: mockRewardsData.carbon_saved_kg + carbonSaved,
      money_saved_pounds: mockRewardsData.money_saved_pounds + moneySaved,
      actions_completed: mockRewardsData.actions_completed + 1
    };
  }

  try {
    // Get current rewards first
    const currentRewards = await getUserRewards(userId);
    
    const updates = {
      total_points: (currentRewards?.total_points || 0) + points,
      carbon_saved_kg: (currentRewards?.carbon_saved_kg || 0) + carbonSaved,
      money_saved_pounds: (currentRewards?.money_saved_pounds || 0) + moneySaved,
      actions_completed: (currentRewards?.actions_completed || 0) + 1
    };

    return await updateUserRewards(userId, updates);
  } catch (error) {
    console.error('Error adding points:', error);
    return null;
  }
}

// AI Tips Functions
export async function getZaiTipsForCategory(category: string, limit: number = 5): Promise<ZaiTip[]> {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: getZaiTipsForCategory', category);
    return mockZaiTips.filter(tip => tip.card_category === category).slice(0, limit);
  }

  try {
    const result = await apiRequest(`/tips/${category}?limit=${limit}`, { method: 'GET' });
    return result;
  } catch (error) {
    console.error('Error fetching Zai tips:', error);
    return [];
  }
}

export async function createZaiTip(tip: Omit<ZaiTip, 'id' | 'created_at'>): Promise<ZaiTip | null> {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: createZaiTip', tip);
    return { 
      id: `mock-tip-${Date.now()}`, 
      ...tip, 
      created_at: new Date().toISOString() 
    };
  }

  try {
    const { data, error } = await supabase
      .from('zai_tips')
      .insert([tip])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating Zai tip:', error);
    return null;
  }
}

// Real-time subscriptions
export function subscribeToUserRewards(userId: string, callback: (rewards: UserReward) => void) {
  if (!hasValidSupabaseConfig) {
    console.log('Mock mode: subscribeToUserRewards', userId);
    // Return a mock subscription
    return {
      unsubscribe: () => console.log('Mock unsubscribe')
    };
  }

  return supabase
    .channel(`user-rewards-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_rewards',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as UserReward);
        }
      }
    )
    .subscribe();
}

// Carbon calculation helpers
export function calculateCarbonSavings(action: string, userData: any): { carbon: number, money: number } {
  const calculations = {
    'public_transport': { carbon: 2.3, money: 5.50 }, // kg CO2, £ per week
    'meatless_meal': { carbon: 0.8, money: 3.20 }, // per meal
    'device_sleep': { carbon: 0.3, money: 0.85 }, // per day
    'second_hand': { carbon: 1.2, money: 8.00 }, // per item
    'train_travel': { carbon: 45, money: 0 }, // long distance vs flight
    'water_saving': { carbon: 0.1, money: 2.10 }, // per week
    'eco_pet_food': { carbon: 0.4, money: -1.50 }, // per week (costs more)
    'walking': { carbon: 0.5, money: 2.00 }, // per trip
    'meal_planning': { carbon: 1.1, money: 4.50 }, // per week
    'streaming_quality': { carbon: 0.2, money: 0.30 }, // per day
    'plant_tree': { carbon: 22, money: 0 }, // lifetime of tree
    'default': { carbon: 0.5, money: 1.00 }
  };

  return calculations[action as keyof typeof calculations] || calculations.default;
}

// Mock data for development
export const mockUserData: UserProfile = {
  id: '1',
  email: 'alex@example.com',
  name: 'alex',
  postcode: 'SW1A 1AA',
  transport_mode: 'car',
  home_type: 'flat',
  spend_amount: 75,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockRewardsData: UserReward = {
  id: '1',
  user_id: '1',
  total_points: 247,
  carbon_saved_kg: 2300,
  money_saved_pounds: 240,
  actions_completed: 18,
  streak_days: 7,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockZaiTips: ZaiTip[] = [
  {
    id: '1',
    card_category: 'travel',
    tip_text: 'using the bus 2x/week instead of driving could save 54kg co₂ annually',
    effectiveness_score: 8.5,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    card_category: 'food',
    tip_text: 'switching to lentils 3x/week saves 2,100l water and reduces carbon by 40%',
    effectiveness_score: 9.2,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    card_category: 'devices',
    tip_text: 'your gaming setup adds ~700kg co₂/year — unplug when not in use',
    effectiveness_score: 7.8,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    card_category: 'shopping',
    tip_text: 'buying second-hand can cut your fashion impact by 60%',
    effectiveness_score: 8.9,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    card_category: 'water',
    tip_text: 'a low-flow showerhead saves 9l/min without reducing pressure',
    effectiveness_score: 8.1,
    created_at: new Date().toISOString()
  }
];

// Environment status check function
export function getSupabaseStatus() {
  return {
    isConfigured: hasValidSupabaseConfig,
    url: supabaseUrl ? 'configured' : 'missing',
    key: supabaseAnonKey ? 'configured' : 'missing',
    mode: hasValidSupabaseConfig ? 'live' : 'mock'
  };
}

// Health check function
export async function checkApiHealth() {
  if (!hasValidSupabaseConfig) {
    return { status: 'mock', message: 'Running in mock data mode' };
  }

  try {
    const result = await apiRequest('/health', { method: 'GET' });
    return result;
  } catch (error) {
    console.error('API health check failed:', error);
    return { status: 'error', message: error.message };
  }
}